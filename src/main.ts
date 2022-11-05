import * as core from "@actions/core";
import * as github from "@actions/github";
import * as fs from "fs";
import Constants from "./util/constants";
import yaml from 'js-yaml';
import { execute } from "./util/syncToAsync";

async function handleAngular(repoName: string, ownerName: string, openApiPath: string, outputPath: string) {

}
async function handleKotlinSpring(repoName: string, ownerName: string, openApiPath: string, outputPath: string) {


  const dottedArtifact = repoName.replace(/-/g, '.');
  const firstArtifact = dottedArtifact.split('.')[0];

  const ymlFile = await fs.promises.readFile(openApiPath, 'utf8')
  const yml: any = yaml.load(ymlFile);

  const version = yml.info.version;

  core.notice("Repository name: "+ repoName);
  core.notice("OpenAPI file path: "+ openApiPath);
  core.notice("OpenAPI version: "+ version);
  
  await execute(`npx @openapitools/openapi-generator-cli generate -i ${openApiPath} -g kotlin-spring -o ${outputPath} --git-user-id "${ownerName}" --git-repo-id "${repoName}" --additional-properties=delegatePattern=true,apiPackage=de.${dottedArtifact},artifactId=${repoName},basePackage=de.${firstArtifact},artifactVersion=${version},packageName=de.${firstArtifact},title=${repoName}`);
  core.notice(`Generated Kotlin Spring code`);

  const pomFile = await fs.promises.readFile(`${outputPath}/pom.xml`, 'utf8')

  const newPomFile = pomFile
    .replace("</project>", Constants.POM_DISTRIBUTION(ownerName, repoName))
    .replace("</properties>", Constants.POM_PROPERTIES);
  core.notice(`Modified project and properties in pom.xml`);

  await fs.promises.writeFile(`${outputPath}/pom.xml`, newPomFile, 'utf8');
  core.notice(`Updated pom.xml`);

  await fs.promises.writeFile(__dirname + '/settings.xml', `<settings><servers><server><id>github</id><username>${githubUsername}</username><password>${githubToken}</password></server></servers></settings>`, 'utf8');
  core.notice(`Created settings.xml`);

  await execute(`cd ${outputPath}; mvn deploy --settings ${__dirname}/settings.xml -DskipTests`);
  core.notice(`Deployed to GitHub Packages`);
}

type SupportedPlatforms = "kotlin-spring" | "typescript-angular" | "kotlin"


const platforms = core.getInput(Constants.PLATFORMS).split(",") as SupportedPlatforms[];

const githubUsername = core.getInput(Constants.GITHUB_USERNAME);
const githubToken = core.getInput(Constants.GITHUB_TOKEN);
const openApiPath = core.getInput(Constants.OPEN_API_FILE_PATH);
const outputPath = core.getInput(Constants.OUTPUT_PATH);

const repoName = github.context.repo.repo as string;
const ownerName = github.context.repo.owner as string;

try {
  platforms.forEach(async platform => {
    switch (platform) {
      case "kotlin-spring":
        await handleKotlinSpring(repoName, ownerName, openApiPath, outputPath);
        break;
      case "typescript-angular":
        await handleAngular(repoName, ownerName, openApiPath, outputPath);
        break;
      default:
        break;
    }
  });
} catch (error) {
  core.setFailed(JSON.stringify(error));
}