export function getAssetUrl (filename: string, isDownload?: boolean): string {
  const assetUrl = new URL(`assets/${filename}`, extract(window.location.href))
  
  if (isDownload) {
    assetUrl.searchParams.set('download', '')
  }
  
  return assetUrl.href
}

export function extract (path: string) {
  const parts = path.split('/')
  const adminIndex = parts.indexOf('admin')
  const rootPath = parts.slice(0, adminIndex).join('/') + '/'
  return rootPath
}
