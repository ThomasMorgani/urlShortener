//TODO: make Class
const destUrl = document.querySelector('#destinationUrl').dataset.desturl //url in which user will be redirected
const actionSection = document.querySelector('.actionSection') //displayed when no errors
const countDownEl = document.querySelector('#countdown') //element where countdown timer will be displayed to end user1
const cancelBtnEl = document.querySelector('#cancelBtn') //btn element to cancel redirect countdown
let activeTimeout = 99999 //setTimeout stored to cancel
let seconds = 8 //amount of time to display landing page before being redirected

const countDownTimer = () => {
  console.log(destUrl)
  console.log(document.querySelector('#destinationUrl'))
  if (!destUrl) {
    setActionSectionText(
      'Redirect not Found <br />Please check the url and try again.'
    )
    cancelBtnEl.classList.add('isHidden')
    return
  }
  actionSection.classList.remove('isHidden')
  seconds = seconds - 1
  if (seconds < 0) {
    window.location = destUrl
  } else {
    countDownEl.innerHTML = seconds
    if (activeTimeout) {
      activeTimeout = setTimeout(countDownTimer, 1000)
    } else {
      countDownEl.innerHTML = ''
    }
  }
}

const setActionSectionText = (text) => {
  actionSection.innerHTML = text
}

if (cancelBtnEl) {
  cancelBtnEl.addEventListener('click', () => {
    activeTimeout = false
    setActionSectionText(
      'Redirect Cancelled. <br /> You can manually visit the destination by clicking the link below.'
    )
  })
}

countDownTimer()
