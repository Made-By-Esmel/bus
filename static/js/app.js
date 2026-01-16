const $ = (id) => document.getElementById(id)
const el = {
    appShell: $('appShell'),
    statusText: $('statusText'),
    statusDot: $('statusDot'),
    statusPill: $('statusPill'),
    searchBtn: $('searchBtn'),
    btnText: $('btnText'),
    btnIcon: $('btnIcon'),
    noticeBox: $('noticeBox'),
    noticeTitle: $('noticeTitle'),
    noticeText: $('noticeText'),
    noticeActions: $('noticeActions'),
    lookupForm: $('lookupForm'),
    progressBar: $('progressBar'),
    resetBtn: $('resetBtn'),
    agency: $('agency'),
    busId: $('busId'),
    headline: $('headline'),
    year: $('year'),
    length: $('length'),
    ptype: $('ptype'),
    line: $('line'),
    lineWrap: $('lineWrap'),
    emptyState: $('emptyState'),
    specUI: $('specUI'),
}

const tokenMeta = document.querySelector('meta[name="csrf-token"]')
const CSRF_TOKEN = tokenMeta?.content || null
const CSRF_HEADERS = CSRF_TOKEN ? { 'X-CSRF-Token': CSRF_TOKEN } : {}

const DOT = 'h-2.5 w-2.5 rounded-full ring-2 ring-white/20 shadow-sm'
const DOT_COLOR = { ready: 'bg-slate-500', loading: 'bg-amber-400', ok: 'bg-emerald-400', error: 'bg-rose-400' }

const BOX_BASE = 'mt-5 rounded-2xl border px-4 py-3 text-sm shadow-lg shadow-black/30 backdrop-blur'
const BOX = {
    error: `${BOX_BASE} border-rose-400/30 bg-rose-500/10 text-rose-100`,
    suggest: `${BOX_BASE} border-amber-300/30 bg-amber-400/10 text-amber-100`,
    info: `${BOX_BASE} border-sky-300/30 bg-sky-400/10 text-sky-100`,
    hidden: 'mt-5 hidden rounded-2xl border px-4 py-3 text-sm',
}
const ACTION_BTN =
    'inline-flex items-center justify-center rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 ring-1 ring-white/15 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-300/40'

const animateNode = (node) => {
    if (!node) return
    node.classList.remove('animate-in')
    void node.offsetWidth
    node.classList.add('animate-in')
}

const setStatus = (type, text) => {
    el.statusText.textContent = text
    el.statusDot.className = `${DOT} ${DOT_COLOR[type] || ''}`.trim()
    if (el.statusPill) el.statusPill.dataset.status = type
    if (el.appShell) el.appShell.dataset.status = type
}

const setLoading = (on) => {
    el.searchBtn.disabled = on
    el.btnText.textContent = on ? 'Searching…' : 'Lookup'
    el.btnIcon.classList.toggle('hidden', on)
    if (el.lookupForm) el.lookupForm.setAttribute('aria-busy', on ? 'true' : 'false')
    if (el.progressBar) el.progressBar.classList.toggle('is-active', on)
}

const clearNotice = () => {
    el.noticeBox.className = BOX.hidden
    el.noticeTitle.textContent = ''
    el.noticeText.textContent = ''
    el.noticeActions.innerHTML = ''
    el.noticeBox.classList.remove('animate-in')
}

const showErrorNotice = (message) => {
    el.noticeBox.className = BOX.error
    el.noticeTitle.textContent = 'Error'
    el.noticeText.textContent = message
    el.noticeActions.innerHTML = ''
    el.noticeBox.classList.remove('hidden')
    animateNode(el.noticeBox)
}

const applySuggestion = (suggestion, busId) => {
    const keyLower = (suggestion.key || '').toLowerCase()
    el.agency.value = keyLower || suggestion.key || ''
    el.busId.value = busId

    setStatus('loading', `Switching to ${suggestion.name ?? suggestion.key}…`)
    clearNotice()
    el.lookupForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
}

const showSuggestionNotice = (suggestions, busId, message) => {
    if (!Array.isArray(suggestions) || !suggestions.length) return

    el.noticeBox.className = BOX.suggest
    const multiple = suggestions.length > 1
    el.noticeTitle.textContent = message || (multiple ? 'Found in other agencies.' : 'Found under another agency.')
    el.noticeText.textContent = multiple
        ? 'We found this vehicle in multiple agencies. Choose one to search.'
        : `We found this vehicle under ${suggestions[0].name}. Switch agency and retry?`

    el.noticeActions.innerHTML = ''
    suggestions.forEach((sugg) => {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = ACTION_BTN
        btn.textContent = `Try ${sugg.name ?? sugg.key}`
        btn.addEventListener('click', () => applySuggestion(sugg, busId))
        el.noticeActions.appendChild(btn)
    })

    el.noticeBox.classList.remove('hidden')
    animateNode(el.noticeBox)
}

const formatAgencyList = (agencies) => {
    if (!agencies?.length) return ''
    if (agencies.length === 1) return agencies[0]
    const [last, ...rest] = agencies.slice().reverse()
    return `${rest.reverse().join(', ')} and ${last}`
}

const showAlsoFoundNotice = (others, busId) => {
    if (!Array.isArray(others) || !others.length) return

    const names = others.map((o) => o.name ?? o.key).filter(Boolean)
    const messageText = names.length ? formatAgencyList(names) : 'another agency'

    el.noticeBox.className = BOX.info
    el.noticeTitle.textContent = 'Also found elsewhere.'
    el.noticeText.textContent = `We also found ${busId || 'this ID'} in ${messageText}.`

    el.noticeActions.innerHTML = ''
    others.forEach((sugg) => {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = ACTION_BTN
        btn.textContent = `Switch to ${sugg.name ?? sugg.key}`
        btn.addEventListener('click', () => applySuggestion(sugg, busId))
        el.noticeActions.appendChild(btn)
    })

    el.noticeBox.classList.remove('hidden')
    animateNode(el.noticeBox)
}

const normSeries = (v) => ((v ?? '').toString().trim() || null)

const extractSpec = (payload) => {
    if (!payload || typeof payload !== 'object') throw new Error('API returned an invalid response.')
    return payload.spec && typeof payload.spec === 'object' ? payload.spec : payload
}

const renderSpec = (spec) => {
    if (!spec || typeof spec !== 'object') throw new Error('Response missing spec fields.')

    const make = spec.make ?? 'Unknown make'
    const model = spec.model ?? 'Unknown model'
    const year = spec.year ?? '—'
    const ptype = spec.propulsion_type ?? '—'
    const len = spec.length_ft ?? '—'
    const series = normSeries(spec.series)
    const displayName = (spec.display_name ?? '').toString().trim() || null

    let headlineText = displayName
    if (!headlineText) {
        let headlineSeries = series
        if (series && make) {
            const [m] = make.split(/\s+/)
            const [s] = series.split(/\s+/)
            if (m && s && m.toLowerCase() === s.toLowerCase()) {
                headlineSeries = series.split(/\s+/).slice(1).join(' ').trim() || null
            }
        }
        headlineText = [year, make, headlineSeries, model].filter(Boolean).join(' ')
    }

    el.headline.textContent = headlineText
    el.year.textContent = year
    el.length.textContent = `${len} ft`
    el.ptype.textContent = ptype

    el.lineWrap.classList.toggle('hidden', !series)
    el.line.textContent = series || ''

    el.emptyState.classList.add('hidden')
    el.specUI.classList.remove('hidden')
    animateNode(el.specUI)
}

const normalizeAgencyList = (list) => {
    const normalized = (Array.isArray(list) ? list : [])
        .map((entry) => {
            if (!entry) return null
            if (typeof entry === 'string') return { key: entry, name: entry }
            const key = entry.key ?? entry.agency ?? entry.id ?? null
            if (!key) return null
            return { key, name: entry.display_name ?? entry.name ?? key }
        })
        .filter(Boolean)
    return normalized.length ? normalized : null
}

const normalizeSuggestions = (detail) => {
    if (!detail || typeof detail !== 'object') return null

    const rawList = Array.isArray(detail.suggested_agencies)
        ? detail.suggested_agencies
        : detail.suggested_agency
        ? [{ key: detail.suggested_agency, name: detail.suggested_agency_name ?? detail.suggested_agency }]
        : []

    return normalizeAgencyList(rawList)
}

const normalizeAlsoFound = (payload) => normalizeAgencyList(payload)

async function fetchFleetSpec({ agency, busId }) {
    const url = `/api/fleet?agency=${encodeURIComponent(agency)}&busId=${encodeURIComponent(busId)}`
    const res = await fetch(url, {
        headers: CSRF_HEADERS,
        referrerPolicy: 'same-origin',
    })

    // safer than res.json() when API sometimes returns non-JSON
    const text = await res.text()
    const body = text ? (() => { try { return JSON.parse(text) } catch { return null } })() : null

    if (res.ok) {
        return {
            ok: true,
            data: body,
            alsoFound: normalizeAlsoFound(body?.also_found_in),
        }
    }

    const detail = body?.detail
    const suggestions = normalizeSuggestions(detail)
    if (suggestions) {
        return {
            ok: false,
            suggestions,
            message:
                (detail && typeof detail === 'object' && typeof detail.message === 'string' && detail.message) ||
                null,
        }
    }

    const msg =
        (typeof detail === 'string' && detail) ||
        (detail && typeof detail === 'object' && detail.message) ||
        null

    throw new Error(msg ?? `API error: ${res.status}`)
}

el.lookupForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    clearNotice()

    const agency = el.agency.value
    const busId = el.busId.value.trim()
    if (!busId) return showErrorNotice('Please enter a vehicle ID.')
    if (!CSRF_TOKEN) {
        setStatus('error', 'CSRF missing.')
        return showErrorNotice('CSRF token missing. Refresh the page and try again.')
    }

    setStatus('loading', 'Scanning registry…')
    setLoading(true)

    try {
        const r = await fetchFleetSpec({ agency, busId })

        if (r.ok) {
            renderSpec(extractSpec(r.data))
            if (r.alsoFound) showAlsoFoundNotice(r.alsoFound, busId)
            setStatus('ok', 'Match confirmed.')
            setTimeout(() => setStatus('ready', 'Ready.'), 900)
        } else if (r.suggestions) {
            const multiple = r.suggestions.length > 1
            setStatus('error', multiple ? 'Found in multiple agencies.' : 'Found under another agency.')
            showSuggestionNotice(r.suggestions, busId, r.message)
        } else {
            throw new Error('Vehicle not found.')
        }
    } catch (err) {
        setStatus('error', 'Error.')
        showErrorNotice(err?.message || 'Something went wrong.')
    } finally {
        setLoading(false)
    }
})

el.resetBtn.addEventListener('click', () => {
    clearNotice()
    el.agency.selectedIndex = 0
    el.busId.value = ''

    el.specUI.classList.add('hidden')
    el.emptyState.classList.remove('hidden')

    setStatus('ready', 'Ready.')
    el.busId.focus()
})

el.busId.focus()
