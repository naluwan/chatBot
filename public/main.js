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
                  ? '<button type="button" class="btn btn-secondary" id="addExams">增加例句</button>'
                  : ''
              }
              <button type="button" class="btn btn-danger" id="deleteBtn">刪除</button>
            </div>
          </div>
          <div class='card-body'> 
            <input class='form-control'
              type='text' 
              name=${isUser ? `userStep_${stepIndex}` : `${actionText}_${stepIndex}`}
              id=${isUser ? `userStep_${stepIndex}` : `${actionText}_${stepIndex}`}
              placeholder='${isUser ? '請輸入使用者對話' : '請輸入機器人回覆'}'
              required
            />
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

// 網頁載入時執行
window.onload = () => {
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
}
