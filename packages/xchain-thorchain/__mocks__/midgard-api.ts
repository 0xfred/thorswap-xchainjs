import nock from 'nock'

import { THORNameResult } from '../src/types'

export const mockThornameLookup = (url: string, address: string, result: THORNameResult) =>
  nock(url)
    .get('/thorname/lookup/' + address)
    .reply(200, result)
