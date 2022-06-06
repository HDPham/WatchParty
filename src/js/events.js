import room from './room';

function removePreloadClass(element) {
  element.classList.remove('preload');
}

function removeAllPreloadClasses() {
  document.querySelectorAll('.preload').forEach(removePreloadClass);
}

function setDarkMode(togglerElement, isDarkMode) {
  togglerElement.setAttribute('aria-pressed', isDarkMode);
  document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
}

function toggleDarkMode(event) {
  const isDarkMode = localStorage.getItem('theme') !== 'dark';

  setDarkMode(event.currentTarget, isDarkMode);
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

function switchTabs(currentTab, nextTab) {
  currentTab.classList.remove('active');
  currentTab.setAttribute('aria-selected', 'false');
  nextTab.classList.add('active');
  nextTab.setAttribute('aria-selected', 'true');
  document.querySelector(currentTab.dataset.target).classList.remove('active');
  document.querySelector(nextTab.dataset.target).classList.add('active');
}

function switchEnterFormTabs(event) {
  const activeTab = document.querySelector('.tab-button.active');

  if (event.currentTarget === activeTab) {
    return;
  }

  switchTabs(activeTab, event.currentTarget);
}

function hideCopyTooltip(event) {
  event.target.nextElementSibling.setAttribute('aria-hidden', 'true');
}

function copyRoomIdToClipboard(event) {
  const tooltip = event.currentTarget.nextElementSibling;

  navigator.clipboard.writeText(room.id).then(() => {
    const animation = new Animation(
      new KeyframeEffect(
        tooltip,
        { opacity: 0, offset: 0 },
        { duration: 100, fill: 'forwards' },
      ),
    );

    tooltip.setAttribute('aria-hidden', 'false');
    animation.play();
  });
}

function toggleUserList() {
  document.querySelector('.user-list-container').classList.toggle('active');
}

function hideUserList(event) {
  if (event.target.closest('.user-list-container')) {
    return;
  }

  document.querySelector('.user-list-container').classList.remove('active');
}

export {
  copyRoomIdToClipboard,
  hideCopyTooltip,
  hideUserList,
  removeAllPreloadClasses,
  setDarkMode,
  switchEnterFormTabs,
  toggleDarkMode,
  toggleUserList,
};
