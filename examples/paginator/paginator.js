// register the paginator component
Vue.component('paginator', {
  template: '#paginator-template',
  replace: true,
  props: {
    total : Number,
    size : Number,
    current : Number
  },
  data: function(){
    return {
        current : this.current || 1,
        total : this.total,//
        size : this.size || 7//显示的页码数
    }
  },

  computed : {
    pages : function(){
            var size = this.size;
            var total = this.total;
            var current = this.current;
            var min=1,max=total;
            var pages = [];

            //提取应该显示的页码数组
            if (size > total) {
                size = total;
                min = 1;
                max = size;
            }
            while(max>=min && max-min>=size){
                    if(max-current>=current-min) max--;
                    else if(max-current<=current-min) min++;
            }

            for(var i = min; i <= max; i++) {
                pages.push(i)
            }

            return pages;
    }
  },

  methods: {
        next : function(){
            if (this.current < this.total) {
                this.current++;
            }
        },

        prev : function(){
            if (this.current > 1) this.current--;
        },

        go : function( number ){
            this.current = number;
        },

        hasNext : function(){
            if (!this.pages.length) return false;

            if (this.current >= this.total) return false;
            return true;
        },

        hasPrev : function(){
            if (!this.pages.length) return false;
            if (this.current <= 1) return false;
            return true;
        }
  }
})

// bootstrap the paginator

var demo = new Vue({
  el: '#app',
  data: {
        current : 2,
        total : 20
  }
})
