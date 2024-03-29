let expanded = false;
let addTaskcontainer = 'empty';
let subtaskPlus = true;
let subtaskObj = [];
let activTaskNumber = '';
let task2 = {};
let taskStatus = 'toDo';
let activeDesk;
let desk = '';

/**
 * THis function resets the task object
 */
function resetTask2() {
    task2 = {
        "taskId": "", // task id - should be a ongoing number
        "taskType": "", //type of task
        "dueDate": "", //date of task /* 21.Sep.23 */
        "status": "", //status of task /*toDo inProgress awaitFeedback done*/
        "headline": "", //title of task
        "description": "", //decription of task
        "doneSubTasks": "", // count of tasks which checked
        "subTaskTotal": "", // count of all tasks
        "subTaskText": [],//needs a push
        "member": [],//needs a push
        "urgency": ""
    }
}

/**
 *This functions for highlight the priority button start
 */
function highlight(prio) {
    if (task2.urgency == prio) {
        removeHighlight()
    } else {
        removeHighlight()
        task2.urgency = prio;
        document.getElementById('id' + prio + 'ContainerAddTaskOv').classList.add(prio)
        document.getElementById('id' + prio + 'IMGAddTaskOv').src = `../assets/img/prio_${prio}_white.svg`
    }
}

/**
 * This function remove the color of all priority elements
 */
function removeHighlight() {
    const PRIO = ['low', 'medium', 'urgent']
    PRIO.forEach(element => {
        document.getElementById('id' + element + 'ContainerAddTaskOv').classList.remove(element)
        document.getElementById('id' + element + 'IMGAddTaskOv').src = `../assets/img/prio_${element}.svg`
    });
    task2.urgency = '';
}

/**
 * This function is for swap of icons
 * @param {number} count - for unique identifier
 */
function switchIons(count) {
    if (count !== 2 || subtaskPlus === true) {
        document.getElementById('idSubtaskPlus').classList.add("d-none");
        document.getElementById('idSubtaskIconContainer').classList.remove("d-none");
        subtaskPlus = false;
    }
    if (count === 4) {
        subtaskPlus = true;
        document.getElementById('idSubtaskPlus').classList.remove("d-none");
        document.getElementById('idSubtaskIconContainer').classList.add("d-none");
        document.getElementById('idSubtaskAddTaskOv').value = '';
    }
}

/**
 * This function adds a new subtask
 */
function addSubtask() {
    let subtask = document.getElementById('idSubtaskAddTaskOv');
    subtask.value !== '' ? subtaskObj.push(subtask.value) : '';
    document.getElementById('idRenderedSubtaskAddTaskOv').innerHTML = '';
    for (let i = 0; i < subtaskObj.length; i++) {
        document.getElementById('idRenderedSubtaskAddTaskOv').innerHTML += subtaskHTML(i);
        subtask.value = '';
    }
}

/**
 * This function delets the selected subtask
 * @param {object} subtaskObjElement 
 */
function deleteSubtask(subtaskObjElement) {
    subtaskObj.splice(subtaskObjElement, 1);
    addSubtask();
}

/**
 * This function is for the edditing of the subtask
 * @param {number} count 
 */
function editSubtask(count) {
    const subtaskText = document.getElementById("idSubTaskText" + count).innerText;
    document.getElementById("idSubTaskTextEditContainer" + count).classList.toggle("subTaskTextEdit");
    document.getElementById("idSubTaskdefaultContainer" + count).classList.toggle("d-none");
    document.getElementById("idSubTaskTextEdit" + count).value = subtaskText;
}

/**
 * This function saves the subtask into the subtask array and call the subTask function
 * @param {number} count - for unique identifier
 */
function editSubtaskText(count) {
    subtaskObj[count] = document.getElementById('idSubTaskTextEdit' + count).value;
    addSubtask();
}

/**
 * this function stores the new or edited task in backend
 * @param {boolean} overlay - true or false to get the information if it was called from overlay or from add_task page
 */
async function storeNewTask(overlay) {
    const taskBtn = document.getElementById('idSubmitButtonAddTaskOv').innerText;
    taskJson = await loadJSON(KEY_for_JSON_TASKS);
    getValuesForTaskArr();
    if (taskBtn === 'Edit Task') {
        taskJson[activTaskNumber] = task2;
        renderOverlayTask(activTaskNumber);
    } else {
        taskJson.push(task2);
        subtaskObj = [];
    }
    setItem(KEY_for_JSON_TASKS, taskJson);
    overlay ? (closeOverlay('idAddTaskOverlay'), showPopup('idAddTaskPopupOv')) : openBoardPage('idAddTaskPopupPage');
}

/**
 * This function shows a popup
 * @param {string} element - elementid
 */
function showPopup(element) {
    document.getElementById(element).style.display = 'flex';
    setTimeout(function () { hidePopup(element); }, 1000);
}

/**
 * This function hides the popup
 * @param {string} element - elementid 
 */
function hidePopup(element) {
    document.getElementById(element).style.display = 'none';
}

/**
 * This function redirects to the "board.html" page. 
 * @param {string} element - elementid 
 */
function openBoardPage(element) {
    document.getElementById(element).style.display = 'flex';
    setTimeout(function () { window.location.href = "../html/board.html"; }, 1000);
}

/**
 * This function is the main function for storing data from the form into the task object. it calls all other functions for this purpose.
 */
function getValuesForTaskArr() {
    task2.taskId = calcTaskId();
    task2.status = taskJson[activTaskNumber] ? taskJson[activTaskNumber].status : taskStatus;
    task2.urgency = task2.urgency === '' ? task2.urgency = 'medium' : task2.urgency;
    getValuesFromForm();
    getSubtaskFromForm();
}

/**
 * this funktion saves data from the form directly into the task object
 */
function getValuesFromForm() {
    task2.taskType = document.getElementById('idSelectCategoryAddTaskOv').value;
    task2.headline = document.getElementById('idInputTitleAddTaskOv').value;
    task2.description = document.getElementById('idInputDescriptionAddTaskOv').value;
    task2.dueDate = new Date(document.getElementById('idInputDueDateAddTaskOv').value).getTime();
}

/**
 * This function takes pushes new subtasks to the task object
 */
function getSubtaskFromForm() {
    task2.subTaskTotal = subtaskObj.length;
    task2.doneSubTasks = 0;
    for (let i = 0; i < subtaskObj.length; i++) {
        let subObj = '';
        subObj = { "label": subtaskObj[i], "checked": false };
        task2.subTaskText.push(subObj);
    }
}

/**
 * This function loads the contacts from backend into the correct assingedTo element
 * @param {string} desk - to assing the correct element
 */
async function loadContacts(desk) {
    document.getElementById('idCheckboxesSelectMultUser' + desk).innerHTML = '';
    contactJSON = await loadJSON(KEY_for_JSON_CONTACS);
    for (let i = 0; i < contactJSON.length; i++) {
        document.getElementById('idCheckboxesSelectMultUser' + desk).innerHTML += userOvHTML(contactJSON[i].name, contactJSON[i].bgColor.slice(1), contactJSON[i].initials, i)
    }
    document.getElementById('idChkSelectMultUserOuterCon' + desk).innerHTML += userOvHTMLButton();
}

/**
 * This function is for showing the contactlist
 * @param {string} desk for identifying the correct assingedTo element
 */
function showUserNames(desk) {
    activeDesk = desk;
    if (!expanded) {
        toggleAssignedToDorpdown(desk);
        document.getElementById('idAddTaskForm').addEventListener('click', handleClickEvent);
        desk == '' || desk == 'Ov' ? addTaskcontainer = 'small' : addTaskcontainer = 'big';
    } else {
        toggleAssignedToDorpdown(desk);
        addTaskcontainer = 'empty';
    }
}

/**
 * this function opens or closes the assinged member menu
 * @param {String} desk - for selevting the correct id
 */
function toggleAssignedToDorpdown(desk) {
    toggleDivUsrDropVsMemberDisk(desk);
    if (expanded) document.getElementById('idSelectedUserAddTask' + desk).innerHTML = taskOverlayMemberDiskContainer();
    expanded = !expanded;
}

/* Event Handler, used to call function handleClickEvent()*/
document.getElementById('idBackgroundContainer').addEventListener('click', handleClickEvent);
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('idAddTaskForm')) document.getElementById('idAddTaskForm').addEventListener('click', handleClickEvent);
});

/**
 * this function closes the assigned to drop down
 * @param {Event} event - the event
 */
function handleClickEvent(event) {
    let elementID = (addTaskcontainer == 'big') ? 'idInputAssignedToContainerDesktopAddTaskOv' : 'idInputAssignedToContainerAddTaskOv';
    let container = document.getElementById(elementID);
    if (expanded && !container.contains(event.target)) toggleAssignedToDorpdown(activeDesk);
}

/**
 * this function is for showing selected members as disc below toe correct assingedTo element
 * @param {string} desk - for identifying the correct assingedTo element
 */
function toggleDivUsrDropVsMemberDisk(desk) {
    let checkboxes = document.getElementById('idChkSelectMultUserOuterCon' + desk);
    let memberDisks = document.getElementById('idSelectedUserAddTask' + desk);
    memberDisks.classList.toggle('d-none');
    checkboxes.classList.toggle('d-none');
}

/**
 * This function recaluclates all task ids and retrun a task id for the new added task
 * @returns -task id for the new added task
 */
function calcTaskId() {
    for (let i = 0; i < taskJson.length; i++) {
        taskJson[i].taskId = i + 1;
    }
    return taskJson.length + 1;
}

/**
 * This function closes the add task overlay
 */
function clearAddTaskForm() {
    document.getElementById('idRenderedSubtaskAddTaskOv').innerHTML = '';
    subtaskObj = [];
    removeHighlight();
}

/**
 * This function opens the add task overlay
 */
async function openAddtaskOverlay(taskStat) {
    resetTask2();
    htmlAddTaskOverlay();
    taskStatus = taskStat;
    await loadContatsToAssinged(true);
    openOrCloseAddTaskOv("idBgAddTaskOverlay");
}

/**
 * this function closes the add task overlay
 */
function openOrCloseAddTaskOv(elementID) {
    document.getElementById(elementID).classList.toggle('bgAddTaskOvSlide');
}

/**
 * This function assing the correct AssingTo Element
 * @param {Boolean} overlay true if overlay
 */
async function loadContatsToAssinged(overlay) {
    desk = getEnding(overlay);
    await loadContacts(desk);
    document.getElementById('idChkSelectMultUserOuterCon' + desk).classList.add('d-none');
    document.getElementById('idInputDueDateAddTaskOv').min = new Date().toISOString().split('T')[0];
}

/**
 * this function returns ending for identification of the correct AssingedTo container
 * @param {Boolean} overlay true if overlay
 * @returns - ending for identification of the correct AssingedTo container
 */
function getEnding(overlay) {
    let element = document.getElementById('idInputAssignedToContainerDesktopAddTaskOv');
    let computedStyles = window.getComputedStyle(element).display;
    if (overlay) {
        return computedStyles === 'flex' ? 'DeskOv' : 'Ov';
    } else {
        resetTask2();
        return computedStyles === 'flex' ? 'Desk' : '';
    }
}

/**
 * This function sets the checked attribute for the assigned to checkboxes
 * @param {number} chkNr - id of checkbox
 */
function toggleChkBox(chkNr) {
    let chkChecked = document.getElementById('idAssingedToChk' + chkNr);
    if (chkChecked.checked) {
        chkChecked.checked = false; toggleselectedAssignTo(chkNr);
        task2.member = task2.member.filter(item => item !== document.getElementById('idAssingedToName' + chkNr).innerText);
    } else {
        chkChecked.checked = true;
        toggleselectedAssignTo(chkNr);
        task2.member.push(document.getElementById('idAssingedToName' + chkNr).innerText);
        task2.member = [...new Set(task2.member)];
    }
}

/**
 * THis function sets and removs the background color of seleted assingTo member
 * @param {number} chkNr - for identifying of correct Checkbox
 */
function toggleselectedAssignTo(chkNr) {
    document.getElementById('idAssingedToCon' + chkNr).classList.toggle('AssingedToChecked');
    document.getElementById('idAssingedToChk' + chkNr).classList.toggle('check_box_checked');
}

/**
 * this function returns the complete HTML code for all members of this task
 * @returns - HTML Code for all member of task
 */
function taskOverlayMemberDiskContainer() {
    let memberHTML = '';
    for (let i = 0; i < task2.member.length; i++) {
        const contactMember = contactJSON.find(contact => contact.name === task2.member[i]);
        if (contactMember && i < 3) {
            const memberColor = contactMember.bgColor.slice(1);
            memberHTML += taskOverlayMemberDiskHTML(memberColor, contactMember.initials, i);
        }
    }
    if (task2.member.length > 3) memberHTML += additionalMember(task2.member.length - 3);
    return memberHTML
}

/**
 * This function opens the contact page
 */
function callAddContact() {
    window.location.href = "../html/contacts.html";
}

/**
 * this funkction clears all subtasks and all checked Members
 */
function resetfields() {
    clearAddTaskForm();
    document.getElementById('idSelectedUserAddTask' + desk).innerText = "";
    for (let i = 0; i < task2.member.length; i++) {
        document.getElementById('idAssingedToCon' + i).classList.remove('AssingedToChecked');
        document.getElementById('idAssingedToChk' + i).classList.add('check_box', 'chkHeight');
        document.getElementById('idAssingedToChk' + i).classList.remove('check_box_checked');
    }
    document.getElementById('idmediumContainerAddTaskOv').classList.add('medium')
    document.getElementById('idmediumIMGAddTaskOv').src = `../assets/img/prio_medium_white.svg`
}