const tabs = document.querySelector('#tabs')
const customTextInput = document.querySelector('#customTextInput')
const destinationUrlInput = document.querySelector('#destinationUrlInput')
const customTextMessageDiv = document.querySelector('#customTextMessage')
const destUrlMessageDiv = document.querySelector('#destUrlMessage')
const feedbackMessageDiv = document.querySelector('#feedbackMessage')
const genUrlBtn = document.querySelector('#genUrlBtn')
const previewUrlP = document.querySelector('#previewUrl')
const saveBtn = document.querySelector('#saveBtn')

const urlTableColMap = [
  {
    displayText: 'TEXT',
    property: 'uriText'
  },
  {
    displayText: 'REDIRECT',
    property: 'redirectUrl'
  },
  {
    displayText: 'VISITS',
    property: 'visitCount'
  },
  {
    displayText: 'LAST VISIT',
    property: 'lastVisit'
  },
  {
    displayText: 'CREATED',
    property: 'created'
  }
]

let formattedUrl = ''
const recentUrls = []

const callApi = async (endpoint) => {
  //expected response {status: 'error || success', message: 'string', data: []}
  const resp = await fetch(api + endpoint)
  if (resp && resp.status === 200) {
    const data = await resp.json()
    return data
  } else {
    return false
  }
}

const copyToClipboard = (inputId) => {
  const input = document.querySelector(`#recentUrlInput${inputId}`)
  const msg = document.querySelector(`#recentUrlMessage${inputId}`)
  if (inputId) {
    input.select()
    input.setSelectionRange(0, 99999)
    document.execCommand('copy')
    setAlert('success', 'Copied to Clipboard', msg)
    // msg.classList.remove('isHidden')
    // setTimeout(() => msg.classList.add('isHidden'), 3500)
  }
}

//TODO: pass in all these params
const formatUrl = (customText, destUrl) => {
  const proto = isSecure ? 'https://' : 'http://'
  customText = customText || customTextInput.value
  destUrl = destUrl || destinationUrlInput.value
  return `${proto}${domainName}${baseUrlParam}${customText}`
}

const generateUrl = async () => {
  // random = await callApi('/generateUrl')
  //TODO: //create args based on options and env vars
  // https://eipl.org/r/urlShortener.php?m=g&l=2222
  resp = await callApi('/?m=g&x=11w')
  //TODO: Create "set value" function?
  if (resp.status === 'success') {
    random = resp.data['0']
    customTextInput.value = random
    formattedUrl = formatUrl(random)
    renderPreviewUrl()
  } else {
    setAlert(resp.status, resp.message)
  }
  return
}

const onCustomTextInput = async (e) => {
  if (validateUrlText(e.target.value)) {
    setMessage(customTextMessageDiv, '')
    formattedUrl = formatUrl()
    renderPreviewUrl()
  } else {
    const msg = 'Invalid text. See requirements'
    setMessage(customTextMessageDiv, msg)
    renderPreviewUrl('-')
  }
}

const onDestUrlInput = async (e) => {
  if (validateUrl(e.target.value)) {
    setMessage(destUrlMessageDiv, '')
    formattedUrl = formatUrl()
    renderPreviewUrl()
  } else {
    const msg = 'Valid url required'
    renderPreviewUrl('-')
    setMessage(destUrlMessageDiv, msg)
  }
}

const onTabClick = async (e) => {
  if (e.target.id === 'tabs') return
  Object.values(tabs.children).forEach((el) => {
    e.target.id === el.id
      ? el.classList.add('active')
      : el.classList.remove('active')
  })
  const tabitem = e.target.id.substring(3).toLowerCase() || null

  switch (tabitem) {
    case 'create':
      document.querySelector('.urlList').classList.add('isHidden')
      document.querySelector('.urlCreate').classList.remove('isHidden')
      setAlert('clear', '', feedbackMessageDiv)
      break
    case 'list':
      document.querySelector('.urlCreate').classList.add('isHidden')
      document.querySelector('.urlList').classList.remove('isHidden')
      const resp = await callApi('/?m=q')
      if (resp.status === 'success') {
        renderUrlTable(resp.data)
      } else {
        console.log('list error')
      }
      break
    default:
      break
  }
}

const renderPreviewUrl = (text = '') => {
  const destUrl = validateUrl(destinationUrlInput.value)

  previewUrlP.innerHTML =
    text !== '' || !destUrl
      ? text
      : `<a href="${formatUrl()}?p=${encodeURI(
          destUrl
        )}" target="blank">${formattedUrl}</a>`
}

const renderRecentItem = (item) => {
  const el = `
  <div class="row">
    <input id="recentUrlInput${item.id}" value="${item.link2}" type="text" readonly></input>
    <div id="recentUrlMessage${item.id}" class="content contentSuccess isHidden ">Copied to clipboard</div>
    <button class="button" data-id="${item.id}">COPY</button>
    </div>
  `
  return el
}

const renderRecentsList = () => {
  const section = document.querySelector('#recentsList') || false
  if (!section) {
    console.log('missing recents section')
    return
  }
  if (recentUrls.length < 1) {
    console.log('no recent urls found')
    return
  }
  section.addEventListener('click', (e) => copyToClipboard(e.target.dataset.id))
  section.innerHTML = recentUrls.map((i) => renderRecentItem(i)).join('')
}

const renderUrlTable = (list) => {
  //TODO: Move to top (when class, constructor)
  const section = document.querySelector('.urlList') || false
  let tableBody = ''
  if (!section) {
    console.log('missing urlList section')
    return
  }
  if (list.length < 1) {
    const colCount = urlTableColMap.length + 1 //plus 1 for "link" column
    tableBody = `<tr><td colspan="${colCount}" class="noData">No data found. Future created Urls will appear here. </td></tr>`
  } else {
    tableBody = list
      .map((listItem) => ` <tr> ${renderUrlTableRow(listItem)} </tr>`)
      .join('')
  }

  section.innerHTML = `
    <table>
      <tr>
      <th>LINK</th>
        ${urlTableColMap.map((prop) => `<th>${prop.displayText}</td>`).join('')}
      </tr>
      ${tableBody}
    </table>    
  `
}

const renderUrlTableRow = (item) => {
  let row = '<tr>'
  row += `<td>
    <a 
      target="blank" 
      href="${formatUrl(item.uriText, item.destUrl)}"
      class="linkIcon"
    >☍</a></td>`
  row += urlTableColMap
    .map((prop) => `<td>${item[prop.property] || ''}</td>`)
    .join('')
  row += '</tr>'
  return row
}

const reset = () => {
  customTextInput.value = ''
  destinationUrlInput.value = ''
  previewUrlP.innerHTML = ''
  formattedUrl = ''
}

const saveUrl = async () => {
  const customText = customTextInput.value || null
  const destUrl = destinationUrlInput.value || null
  let message = ''

  if (!validateUrlText(customText)) {
    message = 'Custom Text is invalid.'
  }

  if (!validateUrl(destUrl)) {
    message =
      message === ''
        ? 'Destination URL is invalid.'
        : message + ' Destination URL is invalid.'
  }

  if (message !== '') {
    setAlert('error', message)
  } else {
    const params = `/?m=s&t=${customTextInput.value}&d=${destinationUrlInput.value}`
    const resp = await callApi(params)
    if (resp && resp.status) {
      if (resp.status === 'success') {
        recentUrls.unshift({
          id: recentUrls.length + 1,
          customText: customText,
          destUrl: destUrl,
          link: `<a href="${destUrl}" target="blank">${customText}</a>`,
          link2: formattedUrl
        })
        setAlert('success', 'Url Saved.')
        renderRecentsList()
        reset()
      } else {
        setAlert(resp.status || null, resp.message || null)
      }
    }
  }
}

const setAlert = (status, text, el) => {
  if (status === 'clear') {
    el.classList.add('isHidden')
    return
  }
  el = el || feedbackMessageDiv
  const exclamationPoint = '&#x2757;'
  const checkmark = '&#x2713;'
  const icon = `<div class="feedbackMark">${
    status === 'success' ? checkmark : exclamationPoint
  }</div>`
  const innerText = icon + `<div>${text}</div>`
  setMessage(el, innerText)
  if (status === 'error') {
    el.classList.add('contentError', 'fadeIn')
    el.classList.remove('isHidden', 'fadeOut', 'contentSuccess')
  }

  if (status === 'success') {
    el.classList.add('contentSuccess', 'fadeIn')
    el.classList.remove('contentError', 'isHidden', 'fadeOut')
    setTimeout(() => {
      el.classList.add('fadeOut')
      el.classList.remove('contentError', 'isHidden', 'fadeIn')
    }, 3500)
    setTimeout(() => {
      el.classList.add('isHidden')
    }, 5000)
  }
}

const setMessage = (el, msg) => {
  //TODO: move status handling to here
  el.innerHTML = msg
}

const validateUrl = (url) => {
  if (typeof url !== 'string' || url.length < 3) {
    return false
  }
  if (url.substring(0, 8) !== 'https://' && url.substring(0, 7) !== 'http://') {
    return 'http://' + url
  } else {
    return url
  }
}

const validateUrlText = (text) => {
  if (typeof text !== 'string' || text.length < 3) {
    return false
  } else {
    const containsInvalid = text
      .split('')
      .every((char) => allowedCharacters.search(char) > -1)

    return containsInvalid
  }
}

customTextInput.addEventListener('input', async (e) => {
  await onCustomTextInput(e)
})

destinationUrlInput.addEventListener('input', async (e) => {
  await onDestUrlInput(e)
})

genUrlBtn.addEventListener('click', async (e) => {
  e.preventDefault()
  await generateUrl()
})

saveBtn.addEventListener('click', async (e) => {
  feedbackMessageDiv.classList.add('isHidden')
  e.preventDefault()
  saveUrl()
})

tabs.addEventListener('click', (e) => onTabClick(e))
