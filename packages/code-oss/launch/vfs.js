// A Little VS to bootstrap some stuff written as shared module.

export const index = `<!DOCTYPE html>
<html lang="en" type="module">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${encodeURIComponent('')}APP</title>
    <style>
      html {
        background:${encodeURIComponent('#000000')};
        color: aliceblue;
      }
    </style>
</head>
<body>
    <h1>Loading...</h1>
</body>
</html>`;
