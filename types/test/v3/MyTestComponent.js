// @ts-check
import { expectTypeNotAny } from '../utils'

import {
  defineComponent,
} from '../../index'


export default defineComponent({
  name: 'MyTestComponent',
  props: {
    a: Number,
  },
  data() {
    return {
    };
  },
  setup(props) {
    expectTypeNotAny(props.a)
  },
  methods: {
  },
})