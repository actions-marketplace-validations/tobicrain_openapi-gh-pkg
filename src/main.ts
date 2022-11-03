import * as core from "@actions/core"
import * as github from "@actions/github"

(
  async () => {
    // get file from repo in the same workflow on github actions
    // const octokit = github.getOctokit(core.getInput('token'));
 
    try {
      const openApiPath = core.getInput("open_api_file");
      const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
      const { data } = await github.getOctokit(GITHUB_TOKEN).rest.repos.getContent({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        path: openApiPath
      });

      console.log(data);
      core.notice(data.toString());
      
      core.notice("Calling our action");
    } catch (error) {
      console.error(error);
    }
  }
)();


// npx @openapitools/openapi-generator-cli generate -i api.yaml -g kotlin-spring -o kotlin --git-user-id "tandamo" --git-repo-id "scanq-client-api" --additional-properties=delegatePattern=true,apiPackage=de.scanq.client-api,artifactId=scanq-client-api,basePackage=de.scanq,artifactVersion=0.1.15,packageName=de.scanq,title=scanq-client-api