import { execute } from "../utils/execute";

export default class OpenApiGenerator {
    
    static async generate(options: {
        input: string;
        output: string;
        generator: string;
        additionalProperties: string[];
        gitUserId: string;
        gitRepoId: string;
    }): Promise<string> {
        const command = `npx @openapitools/openapi-generator-cli generate -i ${options.input} -g ${options.generator} -o ${options.output} --git-user-id ${options.gitUserId} --git-repo-id ${options.gitRepoId} --additional-properties=${options.additionalProperties.join(",")}`;
        return await execute(command);
    }
    
}