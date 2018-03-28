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
	'	<li v-for="index in indexs">',//
	' 		<a v-if="index[1]==null">…</a>',//
	'		<a v-else v-on:click.stop="gotoPage(index[1])" v-bind:class="{\'active\':currentPage==index[1]}">{{index[0]}}</a>',//
	'	</li>',//
	'	<li><span>Page {{currentPage}} of {{totalPages}} </span></li>',//
	'</ul>' ].join(''),
	computed : {
		currentPage : function() {
			return ((this.start / this.limit) | 0) + 1
		},
		totalPages : function() {
			return ((this.total < 0 || this.limit < 1) ? 0 : (((this.total - 1) / this.limit) | 0)) + 1
		},
		indexs : function() {
			var indexs = [], currentPage = this.currentPage, totalPages = this.totalPages, groups = Math.min(this.groups, totalPages);
			var ample = (totalPages > groups ? Math.ceil((currentPage + 1) / groups) : 1);
			var halve = Math.floor((groups - 1) / 2), left = ample > 1 ? currentPage - halve : 1, right = ample > 1 ? (function() {
				var max = currentPage + (groups - halve - 1);
				return Math.min(max, totalPages);
			}()) : groups;

			if (right - left < groups - 1) {
				left = right - groups + 1;
			}
			if (currentPage != 1) {
				indexs.push([ 'Previous', 1 ]);
			}
			if (left > 2) {
				indexs.push([ 1, 1 ], [ '…', null ]);
			}
			while (left <= right) {
				indexs.push([ left, left ]);
				left++;
			}
			if (totalPages > groups && totalPages > right) {
				indexs.push([ '…', null ], [ totalPages, totalPages ]);
			}
			if (currentPage != totalPages) {
				indexs.push([ 'Next', currentPage + 1 ]);
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