import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        map: null
    },
    getters: {
    },
    mutations: {
        setMap(state, value) {
            state.map = value;
        }
    },
    actions: {
    },
    modules: {
    }
});
