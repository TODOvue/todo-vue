export type MenuSelection = string | { url: string }

export type FooterPostLink = {
  label: string
  url: string
}

export type SidebarBlogLink = {
  link: string
}

export type TagLike = {
  id?: string | number
  name?: string
  tag?: string
  color?: string
}

export type ActiveFilter = {
  id: string | number
  name: string
  color: string
}

export type TocLink = {
  id?: string
  depth: number
  text?: string
}

export type TocData = {
  title?: string
  links?: TocLink[]
}

export type BreadcrumbItem = {
  label: string
  href: string
}

export type AppErrorLike = {
  statusCode?: number
  statusMessage?: string
  message?: string
}
