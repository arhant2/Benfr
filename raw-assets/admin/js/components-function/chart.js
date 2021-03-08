import 'chart.js';
import colorAlpha from 'color-alpha';

import cssGlobalVariables from '../utilities/cssGlobalVariables';

Array.from(
  document.getElementsByClassName('js--components-function--chart')
).forEach((element) => {
  const chardata = JSON.parse(element.dataset.chartdata);

  const label = chardata.label;
  const titles = chardata.data.map((el) => el.title);
  const data = chardata.data.map((el) => el.value);

  let colors = JSON.parse(element.dataset.chartcolors);
  let type = element.dataset.charttype;

  for (let i = 0; i < colors.length; i++) {
    if (cssGlobalVariables[`--color-${colors[i]}`]) {
      colors[i] = cssGlobalVariables[`--color-${colors[i]}`];
    }
  }

  if (type === 'line' || type === 'bar') {
    new Chart(element, {
      type,
      data: {
        labels: titles,
        datasets: [
          {
            label,
            data,
            backgroundColor: colorAlpha(colors[0], 0.5),
            borderColor: colors[0],
            borderWidth: 3,
            pointRadius: 1.5,
          },
        ],
      },
      options: {
        // legend: {
        //   onClick: (e) => e.stopPropagation(),
        // },
        responsive: true,
        aspectRatio: 2,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
              gridLines: {
                display: false,
                // drawBorder: false,
              },
            },
          ],
          xAxes: [
            {
              gridLines: {
                display: false,
              },
            },
          ],
        },
      },
    });
    return;
  }

  if (type === 'doughnut' || type === 'pie' || type === 'polarArea') {
    new Chart(element, {
      type,
      data: {
        labels: titles,
        datasets: [
          {
            label,
            backgroundColor: colors,
            data,
          },
        ],
      },
      options: {
        responsive: true,
        aspectRatio: 1,
      },
    });
    return;
  }
});
