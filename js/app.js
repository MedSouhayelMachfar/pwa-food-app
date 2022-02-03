if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((reg) => {
      console.log("Service Worker registered");
      console.log(reg);
    })
    .catch((err) => {
      console.log("service worker not registered");
      console.log(err);
    });
}
