function getIndexInsertOfAlphabeticalArray(arr, item) {
  let low = 0;
  let high = arr.length - 1;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);

    if (arr[mid].localeCompare(item) < 0) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

function isSubarrayEnd(arr1, arr2) {
  if (arr1.length < arr2.length) {
    return false;
  }

  return arr1
    .slice(arr1.length - arr2.length)
    .every((item, index) => item === arr2[index]);
}

function loadSpinner(element, size) {
  const spinner = document.createElement('span');
  const loading = document.createElement('span');
  const text = document.createTextNode('Loading...');

  switch (size) {
    case 'small':
      spinner.classList.add('spinner-border-sm');
      break;
    case 'large':
      spinner.classList.add('spinner-border-lg');
      break;
    default:
      spinner.classList.add('spinner-border-md');
      break;
  }

  spinner.setAttribute('role', 'status');
  loading.classList.add('sr-only');
  loading.appendChild(text);
  spinner.appendChild(loading);
  element.appendChild(spinner);
}

function reflow(element) {
  // eslint-disable-next-line no-void
  void element.offsetHeight;
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.lastChild.remove();
  }
}

export {
  getIndexInsertOfAlphabeticalArray,
  isSubarrayEnd,
  loadSpinner,
  reflow,
  removeAllChildNodes,
};
