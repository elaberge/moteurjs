define(['chai'], (chai) => {
  function delayPromise(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  return {
    expect: chai.expect,
    delayPromise: delayPromise,
  }
});
