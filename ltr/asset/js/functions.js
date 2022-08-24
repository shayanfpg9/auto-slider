export const $ = (
  qr,
  filter = (result) => {
    return result;
  }
) => {
  const select = document.querySelectorAll(qr),
    result =
      select.length > 0 ? (select.length == 1 ? select[0] : select) : undefined;

  if (typeof filter == "function") return filter(result);
};

export function validate(images) {
  const valid = [];

  images.forEach((image) => {
    const name = image.substring(
        image.lastIndexOf("/") + 1,
        image.lastIndexOf(".")
      ),
      match = name.match(
        /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))-([01][0-9]|2[0-4])[0-5][0-9]/g
      );

      if (match && match.length >= 2) {
        valid.push({
        url: image,
        time: match,
      });
    }
  });

  return valid;
}

export function sort(array) {
  array.forEach((item) => {
    const times = [],
      now = Date.now();

    item.time.forEach((time) => {
      time = time.split("-");
      const hm = time[time.length - 1].match(/../g);

      if (+hm[0] == 24) hm[0] = "00";

      time.pop();
      time.join("-");
      times.push(Date.parse(time + " " + hm.join(":")));
    });

    item.live = times[0] <= now && times[1] >= now;

    item.time = {
      start: times[0],
      expire: times[1],
    };
  });

  const srt = (a, b) => (a.time.start < b.time.start ? 1 : -1);

  array.sort(srt);

  if (array.length > 7) {
    const more = array.length - 7;

    if (more % 2 == 0) {
      array.filter((val, i) => {
        if (i < array.length - more / 2 || i + 1 > more / 2) return val;
      });
    } else {
      if ((more - 1) % 2 != 0) {
        array.splice(0, 1);
      } else {
        array.filter((val, i) => {
          if (i < array.length - (more - 1) / 2 || i + 1 > (more - 1) / 2 + 1)
            return val;
        });
      }
    }
  }

  return array;
}

export function clearStatus(query) {
  $(query).forEach((el) => {
    el.classList.remove("active");
    el.classList.remove("next");
  });
}

export function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();

  return (
    rect.right >= 100 &&
    rect.left <= (innerWidth || document.documentElement.clientWidth) - 100
  );
}

export function getTime(time  = Date.now()){
  return [time.getFullYear(), time.getMonth(), time.getDate()].join("-") +
  " " +
  [time.getHours(), time.getMinutes()].join(":")
}