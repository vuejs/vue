/* @flow */

import he from 'he'
import { cached } from 'shared/util'

export default cached(he.decode)
