const $ = (id) => document.getElementById(id)
let pendingSuggestion = null

function setStatus(type, text) {
    $('statusText').textContent = text
    const dot = $('statusDot')
    dot.className = 'h-2.5 w-2.5 rounded-full'
    if (type === 'ready') dot.classList.add('bg-slate-500')
    if (type === 'loading') dot.classList.add('bg-amber-400')
    if (type === 'ok') dot.classList.add('bg-emerald-400')
    if (type === 'error') dot.classList.add('bg-rose-400')
}

function setLoading(isLoading) {
    const btn = $('searchBtn')
    btn.disabled = isLoading
    $('btnText').textContent = isLoading ? 'Loading…' : 'Lookup'
    $('btnIcon').classList.toggle('hidden', isLoading)
}

function clearNotice() {
    const box = $('noticeBox')
    box.classList.add('hidden')
    box.className = 'mt-4 hidden rounded-2xl p-4 ring-1'
    $('noticeTitle').textContent = ''
    $('noticeText').textContent = ''
    $('noticeActionBtn').classList.add('hidden')
    pendingSuggestion = null
}

function showErrorNotice(message) {
    const box = $('noticeBox')
    box.className = 'mt-4 rounded-2xl p-4 ring-1 bg-rose-500/10 ring-rose-400/30 text-rose-100'
    $('noticeTitle').textContent = 'Error'
    $('noticeText').textContent = message
    $('noticeActionBtn').classList.add('hidden')
    box.classList.remove('hidden')
}

function showSuggestionNotice(suggestion, busId) {
    const box = $('noticeBox')
    box.className = 'mt-4 rounded-2xl p-4 ring-1 bg-amber-500/10 ring-amber-300/30 text-amber-100'
    $('noticeTitle').textContent = suggestion.message ?? 'Found under another agency.'
    $('noticeText').textContent = `We found this vehicle under ${suggestion.name}. Switch agency and retry?`

    const btn = $('noticeActionBtn')
    btn.className = 'inline-flex items-center justify-center rounded-xl bg-amber-200 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-amber-200/40'
    btn.classList.remove('hidden')

    const keyLower = (suggestion.key || '').toLowerCase()
    pendingSuggestion = { ...suggestion, busId, keyLower }

    box.classList.remove('hidden')
}

function normalizeSeries(series) {
    const v = (series ?? '').toString().trim()
    return v.length ? v : null
}

function extractSpec(payload) {
    if (!payload || typeof payload !== 'object') throw new Error('API returned an invalid response.')
    if (payload.spec && typeof payload.spec === 'object') return payload.spec
    return payload
}

function renderSpec(spec, agency) {
    if (!spec || typeof spec !== 'object') throw new Error('Response missing spec fields.')

    const make = spec.make ?? 'Unknown make'
    const model = spec.model ?? 'Unknown model'
    const year = spec.year ?? '—'
    const propulsionType = spec.propulsion_type ?? '—'
    const len = spec.length_ft ?? '—'
    const seriesValue = normalizeSeries(spec.series)

    let headlineSeries = seriesValue
    if (seriesValue && make) {
        const makeFirst = make.split(/\s+/)[0]?.toLowerCase()
        const seriesFirst = seriesValue.split(/\s+/)[0]?.toLowerCase()
        if (makeFirst && seriesFirst && makeFirst === seriesFirst) {
            // Avoid repeating make when the series already starts with it
            headlineSeries = seriesValue.split(/\s+/).slice(1).join(' ').trim() || null
        }
    }

    const headlineParts = [year, make]
    if (headlineSeries) headlineParts.push(headlineSeries)
    headlineParts.push(model)
    $('headline').textContent = headlineParts.filter(Boolean).join(' ')

    $('year').textContent = year
    $('length').textContent = len
    $('ptype').textContent = propulsionType

    if (seriesValue) {
        $('line').textContent = seriesValue
        $('lineWrap').classList.remove('hidden')
    } else {
        $('lineWrap').classList.add('hidden')
        $('line').textContent = ''
    }

    const pill = $('agencyPill')
    pill.textContent = agency.toUpperCase()
    pill.classList.remove('hidden')

    $('emptyState').classList.add('hidden')
    $('specUI').classList.remove('hidden')
}

async function fetchFleetSpec({ agency, busId }) {
    const url = `/api/fleet?agency=${encodeURIComponent(agency)}&busId=${encodeURIComponent(busId)}`
    const res = await fetch(url)
    const bodyText = await res.text()

    let body = null
    if (bodyText) {
        try {
            body = JSON.parse(bodyText)
        } catch {
            body = null
        }
    }

    if (res.ok) return { ok: true, data: body }

    const detail = body?.detail
    if (detail && typeof detail === 'object' && detail.suggested_agency) {
        return {
            ok: false,
            suggestion: {
                key: detail.suggested_agency,
                name: detail.suggested_agency_name ?? detail.suggested_agency,
                message: detail.message ?? 'Found under another agency.'
            }
        }
    }

    const detailMessage = (detail && typeof detail === 'string' ? detail : null) || (detail && typeof detail === 'object' && detail.message) || null

    throw new Error(detailMessage ?? `API error: ${res.status}`)
}

const form = $('lookupForm')
const resetBtn = $('resetBtn')
const actionBtn = $('noticeActionBtn')

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    clearNotice()

    const agency = $('agency').value
    const busId = $('busId').value.trim()

    if (!busId) {
        showErrorNotice('Please enter a vehicle ID.')
        return
    }

    setStatus('loading', 'Fetching spec…')
    setLoading(true)

    try {
        const result = await fetchFleetSpec({ agency, busId })

        if (result.ok) {
            const spec = extractSpec(result.data)
            renderSpec(spec, agency)
            setStatus('ok', 'Found.')
            setTimeout(() => setStatus('ready', 'Ready.'), 900)
            return
        }

        if (result.suggestion) {
            setStatus('error', 'Found under another agency.')
            showSuggestionNotice(result.suggestion, busId)
            return
        }

        throw new Error('Vehicle not found.')
    } catch (err) {
        setStatus('error', 'Error.')
        showErrorNotice(err?.message || 'Something went wrong.')
    } finally {
        setLoading(false)
    }
})

actionBtn.addEventListener('click', (e) => {
    e.preventDefault()
    if (!pendingSuggestion) return

    const targetAgency = pendingSuggestion.keyLower || pendingSuggestion.key || ''
    $('agency').value = targetAgency
    $('busId').value = pendingSuggestion.busId

    setStatus('loading', `Switching to ${pendingSuggestion.name}…`)
    clearNotice()

    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
})

resetBtn.addEventListener('click', () => {
    clearNotice()
    $('agency').selectedIndex = 0
    $('busId').value = ''

    $('specUI').classList.add('hidden')
    $('emptyState').classList.remove('hidden')

    $('agencyPill').classList.add('hidden')
    $('agencyPill').textContent = '—'

    setStatus('ready', 'Ready.')
    $('busId').focus()
})

$('busId').focus()
