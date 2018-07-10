import Vue from 'vue'
import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'

if (RAVEN_CONFIG) {
  Raven
    .config(RAVEN_CONFIG, {
      ignoreErrors: ['ResizeObserver loop limit exceeded'],
      release: GIT_SHA1,
    })
    .addPlugin(RavenVue, Vue)
    .install()
}
