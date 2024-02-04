export interface Info {
    source: string
    dest?: string
    dir?: boolean
}
export interface Meta {
    entries: Array<Info>
}