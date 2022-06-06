import { removeAllChildNodes } from './utils';

function changePageContent(pathname) {
  const createButton = document.forms.create.querySelector('button');
  const joinButton = document.forms.join.querySelector('button');
  const leaveBtn = document.querySelector('.leave-btn');
  const pageContents = document.querySelectorAll('.page-content');

  switch (pathname) {
    case '/':
      leaveBtn.hidden = true;
      createButton.disabled = false;
      joinButton.disabled = false;
      removeAllChildNodes(createButton);
      removeAllChildNodes(joinButton);
      createButton.textContent = 'Create';
      joinButton.textContent = 'Join';
      break;
    case '/room':
      leaveBtn.hidden = false;
      break;
    default:
      break;
  }

  pageContents.forEach((pageContent) => {
    pageContent.classList.toggle(
      'active',
      pageContent.dataset.pathname === pathname,
    );
  });
}

function changePage(pathname) {
  window.history.pushState(null, null, pathname);
  changePageContent(pathname);
}

function handleRoute(event) {
  event.preventDefault();
  changePage(event.currentTarget.getAttribute('href'));
}

export { changePageContent, changePage, handleRoute };
