import * as packageInfo from "../../package.json";

export const VERSION = packageInfo.version;

export function gitInfo(): string {
	return `SNIK Graph version ${VERSION}
commit date ${import.meta.env.VITE_GIT_COMMIT_DATE}
${import.meta.env.VITE_GIT_LAST_COMMIT_MESSAGE}
${import.meta.env.VITE_GIT_BRANCH_NAME}/${import.meta.env.VITE_GIT_COMMIT_HASH}`;
}
