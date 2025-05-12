import { match } from 'path-to-regexp'
import routes from './routes'

const matchFns = routes.map(route => match(route.path))

export default (pathname, props = {}) => {
  for (let i = 0; i < matchFns.length; i++) {
    const matchResult = matchFns[i](pathname)

    if (matchResult) {
      return () => routes[i].handler({ ...props, ...matchResult })
    }
  }

  return undefined
}
