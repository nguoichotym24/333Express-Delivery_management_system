import { config } from './config/env'
import app from './app'
import { ping } from './db/pool'

async function start() {
  try {
    await ping()
    // eslint-disable-next-line no-console
    console.log('DB connected')
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('DB connection failed:', e)
  }
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${config.port}`)
  })
}

start()

