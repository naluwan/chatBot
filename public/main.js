// 機器人回覆代號產生器
function randomBotResName() {
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const upper = lower.toUpperCase()
  const num = '1234567890'
  const randomText = lower + upper + num
  let text = 'utter_'
  for (let i = 0; i < 9; i += 1) {
    text += randomText[Math.floor(Math.random() * randomText.length)]
  }
  let actionsArr = []
  // 回資料庫查找所有actions
  fetch('http://localhost:3333/stories/actions')
    .then(res => res.json())
    .then(actions => {
      actionsArr = actions
    })
  // 驗證action是否重複
  if (actionsArr.some(action => action === text)) {
    randomBotResName()
    return
  }

  return text
}

// 建立step template
function createTemplate(role, stepIndex) {
  const isUser = role === 'user'
  let actionText = ''
  if (role !== 'user') {
    actionText = randomBotResName()
  }
  const stepDiv = document.createElement('div')
  stepDiv.setAttribute(
    'class',
    `form-row mb-3 d-flex justify-content-${isUser ? 'start' : 'end'} step`
  )
  stepDiv.setAttribute('id', `${isUser ? 'userStepDiv' : 'botStepDiv'}`)
  const stepTemplate = `
      <div class='col-8'> 
        <div class='card'>
          <div class='card-header d-flex justify-content-between align-items-center'> 
            <h5> 
              ${isUser ? '使用者' : '機器人'} 
            </h5>
            <div>
              ${
                isUser
                  ? ` 
                      <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target=${`#addExamples-${stepIndex}`}>
                        增加例句
                      </button>
                    `
                  : ''
              }
              <button type="button" class="btn btn-danger" id="deleteBtn">刪除</button>
            </div>
          </div>
          <div class='card-body'> 
          ${
            isUser
              ? `
                  <input class='form-control'
                    type='text' 
                    name=${`userStep_${stepIndex}`}
                    id=${`userStep_${stepIndex}`}
                    placeholder='請輸入使用者對話'
                    style="font-size: 1.25rem;"
                    required
                  />
                  <div class="modal fade" id=${`addExamples-${stepIndex}`} data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h5 class="modal-title" id="addExamplesLabel">新增例句</h5>
                          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                          <textarea class="col-12" name=${`addExamples-${stepIndex}`} id=${`addExamples-${stepIndex}`} rows="5" style="font-size: 1.25rem;"
                          placeholder="請填入例句，多例句請用『,』符號分開"></textarea>
                        </div>
                        <div class="modal-footer">
                          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">儲存</button>
                        </div>
                      </div>
                    </div>
                  </div>
                `
              : `<textarea class='form-control'
                  type='text' 
                  name=${`${actionText}_${stepIndex}`}
                  id=${`${actionText}_${stepIndex}`}
                  placeholder='請輸入機器人回覆'
                  rows='5'
                  style="font-size: 1.25rem;"
                  required
                  ></textarea>`
          }
          </div>
        </div> 
      </div> 
  `
  stepDiv.innerHTML = stepTemplate
  return stepDiv
}

// 點擊刪除按鈕事件
function clickDeleteBtn() {
  const deleteBtns = document.querySelectorAll('#deleteBtn')
  deleteBtns.forEach(deleteBtn => {
    deleteBtn.addEventListener('click', e => {
      const target = e.target
      target.parentElement.parentElement.parentElement.parentElement.parentElement.remove()
      const isLastUser = document.querySelector('.step-panel').lastElementChild.getAttribute('id')
      const userStepBtn = document.querySelector('#userStepBtn')
      if (isLastUser === 'userStepDiv') {
        userStepBtn.setAttribute('disabled', '')
      } else {
        userStepBtn.removeAttribute('disabled')
      }
    })
  })
}

// 點擊使用者按鈕事件
function clickUserStepBtn() {
  const userStepBtn = document.querySelector('#userStepBtn')

  userStepBtn.addEventListener('click', e => {
    const allStep = document.querySelectorAll('.step')

    let userStep
    if (!allStep) {
      userStep = createTemplate('user', '0')
    } else {
      userStep = createTemplate('user', allStep.length)
    }

    document.querySelector('.step-panel').appendChild(userStep)

    clickDeleteBtn()

    userStepBtn.setAttribute('disabled', '')
  })
}

// 點擊機器人按鈕事件
function clickBotStepBtn() {
  const botStepBtn = document.querySelector('#botStepBtn')

  botStepBtn.addEventListener('click', e => {
    const allStep = document.querySelectorAll('.step')
    let botStep
    if (!allStep) {
      botStep = createTemplate('bot', '0')
    } else {
      botStep = createTemplate('bot', allStep.length)
    }

    document.querySelector('.step-panel').appendChild(botStep)
    clickDeleteBtn()

    const userStepBtn = document.querySelector('#userStepBtn')
    userStepBtn.removeAttribute('disabled')
  })
}

// loading
function loading() {
  const InpBox = document.createElement('div')
  InpBox.setAttribute('id', 'loading')

  const loading = document.createElement('img')
  loading.src = '/images/loading.svg'

  InpBox.appendChild(loading)

  document.body.appendChild(InpBox)
}

// loading close
function loadingClose() {
  document.querySelector('#loading') && document.querySelector('#loading').remove()
}

// showBox
function showBox(INFO, ID, CLOSE, FUN) {
  /*
    INFO =放入彈出視窗的 html
    ID = 彈出視窗的名字
    CLOSE = 不需要關閉按鈕才需指定參數為 "N"
    FUN = 當有關閉按鈕,關閉視窗後執行程式
    */

  const InpBox = document.createElement('div')
  InpBox.setAttribute('class', 'showBox')

  if (ID !== undefined) {
    InpBox.setAttribute('id', ID)
  }

  document.body.style.overflow = 'hidden'
  document.body.appendChild(InpBox)

  const InpBoxDiv1 = document.createElement('div')
  const InpBoxDiv2 = document.createElement('div')
  InpBoxDiv2.setAttribute('class', 'content')
  InpBoxDiv2.style.overflow = 'auto'
  InpBoxDiv2.innerHTML = INFO

  InpBoxDiv1.appendChild(InpBoxDiv2)
  InpBox.appendChild(InpBoxDiv1)

  window.addEventListener('resize', RESIZE)

  function RESIZE() {
    const WH = document.documentElement.clientHeight
    const MH2 = InpBoxDiv2
    if (localStorage.getItem('ZOOM') == null) {
      MH2.style.maxHeight = Math.floor(WH * 0.9 - 40) + 'px'
    } else {
      MH2.style.maxHeight = Math.floor(WH * 0.9 - 40) / localStorage.getItem('ZOOM') + 'px'
    }
  }

  RESIZE()

  /* 區塊外點擊關閉視窗 */
  if (CLOSE === undefined || CLOSE !== 'N') {
    showboxClose(InpBox, FUN)
  } else {
    InpBox.classList.add('noClose')
  }
}

// showBox close
function showboxClose(inputBox, fun) {
  const boxBack = document.createElement('span')
  boxBack.setAttribute('style', 'width:100%;height:100%;display:block;position:fixed;top:0;left:0;')
  inputBox.appendChild(boxBack)

  // 加入關閉視窗按鈕
  const CLOSE = document.createElement('span')
  CLOSE.setAttribute('class', 'close')
  inputBox.querySelector('div').appendChild(CLOSE)

  // X 關閉視窗
  CLOSE.onclick = function () {
    boxClose()
  }

  // 內容外 關閉視窗
  boxBack.onclick = function () {
    boxClose()
  }

  // 視窗彈出鍵盤 ESC 關閉視窗
  if (window.event) {
    document.documentElement.onkeydown = function (event) {
      if (window.event.keyCode === 27) {
        boxClose()
      }
    }
  } else {
    document.documentElement.onkeydown = function (event) {
      if (event.key === 'Escape') {
        boxClose()
      }
    }
  }

  function boxClose() {
    inputBox.outerHTML = ''
    if (!document.querySelector('.showBox')) {
      document.body.style.overflow = ''
    }
    document.documentElement.onkeydown = ''

    if (fun) {
      fun()
    }
  }
}

// 確認機器人伺服器訓練狀況，每五秒發送一次確認
function checkRasaStatus() {
  const train = document.querySelector('#train-button')
  if (train) {
    function cb(data) {
      console.log(data)
      if (data !== 0) {
        if (train.getAttribute('disabled') !== '') {
          train.innerHTML = '<i class="fa-solid fa-spinner fa-spin fa-fw"></i>  機器人訓練中'
          train.setAttribute('disabled', '')
        }
      } else {
        train.innerText = '執行訓練'
        train.removeAttribute('disabled')
      }

      setTimeout(() => {
        checkRasaStatus()
      }, 5000)
    }
    fetch('http://192.168.10.105:5005/status')
      .then(res => res.json())
      .then(data => data.num_active_training_jobs)
      .then(trainCount => cb(trainCount))
  }
}

// 網頁載入時執行
window.onload = () => {
  checkRasaStatus()
  if (document.querySelector('#createStoryForm')) {
    const isLastUser = document
      .querySelector('#createStoryForm')
      .lastElementChild.previousElementSibling.getAttribute('id')
    const userStepBtn = document.querySelector('#userStepBtn')
    if (isLastUser === 'userStepDiv') {
      userStepBtn.setAttribute('disabled', '')
    } else {
      userStepBtn.removeAttribute('disabled')
    }
    clickUserStepBtn()
    clickBotStepBtn()
  }

  if (document.querySelector('#deleteStoryBtn')) {
    const deleteBtns = document.querySelectorAll('#deleteStoryBtn')
    deleteBtns.forEach(deleteBtn => {
      deleteBtn.addEventListener('click', e => {
        const target = e.target
        console.log(target)
        const deleteText = document.querySelector('#deleteText')
        const deleteForm = document.querySelector('#deleteForm')
        deleteForm.action = `/stories/${target.dataset.story}?_method=delete`
        deleteText.innerText = target.dataset.story
      })
    })
  }

  if (document.querySelector('#train-button')) {
    const trainBtn = document.querySelector('#train-button')
    trainBtn.addEventListener('click', e => {
      fetch('http://192.168.10.105:5005/status')
        .then(res => res.json())
        .then(data => data.num_active_training_jobs)
        .then(trainCount => {
          if (trainCount !== 0) {
            checkRasaStatus()
          } else {
            loading()
            trainBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin fa-fw"></i>  機器人訓練中'
            trainBtn.setAttribute('disabled', '')
            fetch('http://localhost:3333/train/trainData')
              .then(res => res.json())
              .then(data => {
                return fetch(
                  'http://192.168.10.105:5005/model/train?save_to_default_model_directory=true&force_training=true',
                  {
                    method: 'post',
                    body: JSON.stringify(data),
                    headers: {
                      'content-Type': 'application/json'
                    }
                  }
                )
              })
              .then(res => res.headers.get('filename'))
              .then(fileName => {
                const payload = {
                  model_file: `/home/bill/Work/BF36_RASA_2.8.31_spacy/models/${fileName}`
                }
                return fetch('http://192.168.10.105:5005/model', {
                  method: 'put',
                  body: JSON.stringify(payload),
                  headers: {
                    'content-Type': 'application/json'
                  }
                })
              })
              .then(res => {
                if (res.status === 204) {
                  loadingClose()
                  const html =
                    "<h3 style='text-align:center;'><div class='sa-icon success'><span></span></div>訓練完成</h3>"
                  return showBox(html, 'message')
                }
              })
          }
        })
    })
  }
}

window.onfocus = () => {
  checkRasaStatus()
}
