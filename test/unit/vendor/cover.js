var Cover = (function () {

    function getStats (cov) {
        var stats = []
        for (var file in cov) {
            stats.push(getFileStats(file, cov[file]))
        }
        return stats
    }

    function getFileStats (name, file) {
        var stats = {
            filename: name,
            sloc: file.length,
            misses: 0,
            coverage: 0,
            src: file.source,
            uncoveredNums: {}
        }
        for (var i = 0; i < file.length; i++) {
            if (file[i] === 0) {
                // uncovered
                stats.misses++
                stats.uncoveredNums[i - 1] = true
            } else if (!isEffective(file.source[i])) {
                stats.sloc--
            }
        }
        stats.hits = stats.sloc - stats.misses
        stats.coverage = (stats.sloc - stats.misses) / stats.sloc * 100
        return stats
    }

    function isEffective (line) {
        if (!line) return false
        line = line.trim()
        var c = line.charAt(0)
        return line &&
            c !== '/' &&
            c !== '*'
    }

    function buildIndicator (data) {
        var el = document.createElement('ul')
        el.id = 'cover-stats'
        ;['sloc', 'hits', 'misses'].forEach(function (item) {
            el.appendChild(buildStat(item, data[item]))
        })
        el.appendChild(buildCov(data.coverage))
        document.getElementById('mocha').appendChild(el)
    }

    function buildStat (name, data) {
        var el = document.createElement('li')
        el.innerHTML = '<span class="name">' + name + ':</span>' + ' <em class="' + name + '">' + data + '</em>'
        return el
    }

    function buildCov (cov) {
        var el = document.createElement('li')
        el.classList.add('cov')
        el.innerHTML = Math.round(cov) + '%'
        return el
    }

    function buildSource (file) {
        var src = document.createElement('pre')
        src.id = "cover-src"
        file.src.forEach(function (line, i) {
            src.appendChild(buildLine(i, line, file.uncoveredNums[i]))
            src.appendChild(document.createElement('br'))
        })
        document.body.appendChild(src)
    }

    function buildLine (i, line, uncovered) {
        var p = document.createElement('p'),
            src = document.createElement('span')
        src.textContent = line + ' '
        if (uncovered) {
            src.classList.add('uncovered')
        }
        p.innerHTML = i + pad(i)
        p.appendChild(src)
        return p
    }

    function pad (n) {
        var ret = '', i = 8, n = n.toString().length
        while (i-- > n) {
          ret += ' '
        }
        return ret
    }

    return {
        report: function () {
            var stats = getStats(_$jscoverage)
            buildIndicator(stats[0])
            buildSource(stats[0])
        },
        getStats: function () {
            return getStats(_$jscoverage)
        }
    }

})()