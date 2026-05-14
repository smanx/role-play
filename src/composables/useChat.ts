export interface CompiledRegexScript {
  regex: RegExp
  replacement: string
  placement: number[]
  promptOnly: boolean
  markdownOnly: boolean
  name: string
}
