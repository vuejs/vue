Vue.component('pagination', {
	props : {
		start : {
			type : Number,
			'default' : 0
		},
		limit : {
			type : Number,
			'default' : 20
		},
		total : {
			type : Number,
			'default' : 0
		},
		groups : {
			type : Number,
			'default' : 5
		}
	},
	template : [ //
	'<ul class="y-page">',//
	'	<li v-if="hasPrevious"><a v-on:click.stop="gotoPage(currentPage-1)">Previous</a></li>',//
	'	<li v-for="index in indexs">',//
	' 		<a v-if="index==null">…</a>',//
	'		<a v-else v-on:click.stop="gotoPage(index)" v-bind:class="{\'active\':currentPage==index}">{{index}}</a>',//
	'	</li>',//
	'	<li><span>Page {{currentPage}} of {{totalPages}} </span></li>',//
	'	<li v-if="hasNext"><a v-on:click.stop="gotoPage(currentPage+1)">Next</a></li>',//
	'</ul>' ].join(''),
	computed : {
		currentPage : function() {
			return ((this.start / this.limit) | 0) + 1
		},
		totalPages : function() {
			return ((this.total < 0 || this.limit < 1) ? 0 : (((this.total - 1) / this.limit) | 0)) + 1
		},
		hasPrevious : function() {
			return this.currentPage != 1
		},
		hasNext : function() {
			return this.currentPage != this.totalPages
		},
		indexs : function() {
			var indexs = [], groups = this.groups, currentPage = this.currentPage, totalPages = this.totalPages;
			var ample = (totalPages > groups ? Math.ceil((currentPage + 1) / groups) : 1);
			var halve = Math.floor((groups - 1) / 2), left = ample > 1 ? currentPage - halve : 1, right = ample > 1 ? (function() {
				var max = currentPage + (groups - halve - 1);
				return Math.min(max, totalPages);
			}()) : groups;

			if (right - left < groups - 1) {
				left = right - groups + 1;
			}
			if (left > 2) {
				indexs.push(1, null);
			}
			while (left <= right) {
				indexs.push(left++);
			}
			if (totalPages > groups && totalPages > right) {
				indexs.push(null, totalPages);
			}
			return indexs;
		}
	},
	methods : {
		gotoPage : function(pageNo) {
			var start = (pageNo < 1 || this.limit < 1) ? -1 : (pageNo - 1) * this.limit;
			if (start !== this.start) {
				this.$emit('offset', start);
			}
		}
	}
});