
/**
 * this task renders the card which should be edited
 * @param {Number} taskNr - number of task
 */
async function renderEditTask(taskNr) {
    activTaskNumber = taskNr;
    await openAddtaskOverlay();
    document.getElementById('idHeadlineAddTask').innerText = "Edit Task";
    addDataEditTaskOverlay(taskNr);
}


/**
 * this function calls different function for adding values from task JSON to html
 * 
 * @param {number} taskNumber - number of clicked task
 */
function addDataEditTaskOverlay(taskNr) {
    let activeTask = taskJson[taskNr]; 
    editTaskLoadValues(activeTask); 
}

/**
 * This function adds the Headline of task to the html element
 * 
 * @param {object} activeTask - contains active task
 */
function editTaskLoadValues(activeTask) {
    document.getElementById('idInputTitleAddTaskOv').value = activeTask.headline;
    document.getElementById('idInputDescriptionAddTaskOv').value = activeTask.description;
    setUrgency(activeTask.urgency)
    document.getElementById('idInputDueDateAddTaskOv').value = new Date(activeTask.dueDate).toISOString().split('T')[0];
    document.getElementById('idSelectCategoryAddTaskOv').selectedIndex = selectCategory(activeTask.taskType);
    getSubtasks(activeTask);
    addSubtask();
    document.getElementById('idHeadlineAddTask').innerText === "Edit Task" ? setChkForTaskMember(taskJson[activTaskNumber].member) : '';
    document.getElementById("idSelectedUserAddTaskOv").innerHTML = taskOverlayMemberDiskContainer();
    document.getElementById("idSelectedUserAddTaskDeskOv").innerHTML = taskOverlayMemberDiskContainer();
    document.getElementById("idSubmitButtonAddTaskOv").innerText = 'Edit Task';
}

/**
 * this function sets the priority to the stored vales
 * @param {String} prio - prio which should be set
 */
function setUrgency(prio) {
    task2.urgency = prio;
    if (prio !== 'medium') {
        document.getElementById('id' + prio + 'ContainerAddTaskOv').classList.add(prio);
        document.getElementById('id' + prio + 'IMGAddTaskOv').src = `../assets/img/prio_${prio}_white.svg`;
        document.getElementById('idmediumContainerAddTaskOv').classList.remove('medium');
        document.getElementById('idmediumIMGAddTaskOv').src = `../assets/img/prio_medium.svg`;
    }
}

/**
 * this function add all subtasks to the subtaskObj 
 * @param {object} activeTask  - contains active task
 */
function getSubtasks(activeTask) {
    subtaskObj = [];
    activeTask.subTaskText.forEach(subtask => {
        subtaskObj.push(subtask.label);
    });
}

/**
 * this function returns the index of the catagory within the array
 * @param {String} cat - category of task
 * @returns - returns the index
 */
function selectCategory(cat) {
    let selectElement = document.getElementById("idSelectCategoryAddTaskOv");
    for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].value === cat) return i;
    }
}

/**
 * this function set all selected members checked in the edit card
 * @param {Object} taskMember - contains all members of the task
 */
function setChkForTaskMember(taskMember) {
    for (let i = 0; i < taskMember.length; i++) {
        const contactIndex = contactJSON.findIndex(contact => contact.name === taskMember[i]);
        let chkChecked = document.getElementById('idAssingedToChk' + contactIndex);
        if (contactIndex != -1) {
            chkChecked.checked = true;
            task2.member.push(taskMember[i]);
        }
    }
}