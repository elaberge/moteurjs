define(() => {
  'use strict';

  return {
    load: (name, require, onload) => {
      const xhr = new XMLHttpRequest();

      xhr.open('GET', name, true);
      xhr.responseType = 'arraybuffer';

      xhr.onload = () => {
        onload(xhr.response);
      };

      xhr.send();
    },
  };
});
