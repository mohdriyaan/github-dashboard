declare module "github-colors" {
  const GitHubColors: {
    get: (
      language: string,
      handleOthers?: boolean
    ) => {
      color?: string
      [key: string]: unknown
    } | undefined
  }

  export default GitHubColors
}