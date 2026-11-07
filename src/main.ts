import './styles/base.css'
import './styles/views.css'
import './styles/fx.css'
import { parse } from './router.ts'
import { board } from './views/board.ts'
import { grid } from './views/grid.ts'
import { home } from './views/home.ts'

const root = document.getElementById('app')
if (!root) throw new Error('Qalam: #app mount point missing from index.html')
const app = root
let screen = new AbortController()

/** Draw the screen for the current hash; the previous screen's listeners and timers die first. */
function render(): void {
  screen.abort()
  screen = new AbortController()
  const route = parse(location.hash)
  app.replaceChildren()
  app.dataset.view = route.view
  if (route.view === 'home') home(app, screen.signal)
  else if (route.view === 'grid') grid(app, route.set, screen.signal)
  else board(app, route.set, route.letter, route.glyph, screen.signal)
  document.title = route.view === 'board' ? `${route.letter.char} · Qalam` : 'Qalam'
  scrollTo(0, 0)
}

addEventListener('hashchange', render)
render()
