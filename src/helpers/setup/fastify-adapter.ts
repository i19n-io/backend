import { FastifyAdapter } from '@nestjs/platform-fastify'

export const setupFastifyAdapter = () => {
  const fastifyAdapter = new FastifyAdapter()

  /**
   * @see https://github.com/nestjs/nest/issues/5702#issuecomment-979893525
   */
  fastifyAdapter.getInstance().addHook('onRequest', (request, reply, done) => {
    // @ts-expect-error Fix for the "res.setHeader is not a function TypeError"
    reply.setHeader = function (k, v) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.raw.setHeader(k, v)
    }

    // @ts-expect-error Fix for the "res.setHeader is not a function TypeError"
    reply.end = function () {
      this.raw.end()
    }

    // @ts-expect-error Fix for the "res.setHeader is not a function TypeError"
    request.res = reply

    done()
  })

  return fastifyAdapter
}
