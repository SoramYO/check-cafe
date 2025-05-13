"use strict";
const os = require("os");
const readline = require("readline");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  blink: "\x1b[5m",
  inverse: "\x1b[7m",
  hidden: "\x1b[8m",
  
  // Foreground colors
  fgBlack: "\x1b[30m",
  fgRed: "\x1b[31m",
  fgGreen: "\x1b[32m",
  fgYellow: "\x1b[33m",
  fgBlue: "\x1b[34m",
  fgMagenta: "\x1b[35m",
  fgCyan: "\x1b[36m",
  fgWhite: "\x1b[37m",
  
  // Bright foreground
  fgBrightBlack: "\x1b[90m",
  fgBrightRed: "\x1b[91m",
  fgBrightGreen: "\x1b[92m",
  fgBrightYellow: "\x1b[93m",
  fgBrightBlue: "\x1b[94m",
  fgBrightMagenta: "\x1b[95m",
  fgBrightCyan: "\x1b[96m",
  fgBrightWhite: "\x1b[97m",
  
  // Background colors
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
  
  // Bright background
  bgBrightBlack: "\x1b[100m",
  bgBrightRed: "\x1b[101m",
  bgBrightGreen: "\x1b[102m",
  bgBrightYellow: "\x1b[103m",
  bgBrightBlue: "\x1b[104m",
  bgBrightMagenta: "\x1b[105m",
  bgBrightCyan: "\x1b[106m",
  bgBrightWhite: "\x1b[107m",
  
  // Special gradients
  rainbow: ["\x1b[31m", "\x1b[33m", "\x1b[32m", "\x1b[36m", "\x1b[34m", "\x1b[35m"],
  sunset: ["\x1b[31m", "\x1b[33m", "\x1b[35m"],
  ocean: ["\x1b[34m", "\x1b[36m", "\x1b[94m"],
  forest: ["\x1b[32m", "\x1b[92m", "\x1b[33m"],
  neon: ["\x1b[93m", "\x1b[95m", "\x1b[96m"]
};

// Box drawing characters
const box = {
  single: {
    topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘',
    horizontal: '─', vertical: '│', 
    leftT: '├', rightT: '┤', topT: '┬', bottomT: '┴', cross: '┼'
  },
  double: {
    topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝',
    horizontal: '═', vertical: '║',
    leftT: '╠', rightT: '╣', topT: '╦', bottomT: '╩', cross: '╬'
  },
  rounded: {
    topLeft: '╭', topRight: '╮', bottomLeft: '╰', bottomRight: '╯',
    horizontal: '─', vertical: '│',
    leftT: '├', rightT: '┤', topT: '┬', bottomT: '┴', cross: '┼'
  },
  heavy: {
    topLeft: '┏', topRight: '┓', bottomLeft: '┗', bottomRight: '┛',
    horizontal: '━', vertical: '┃',
    leftT: '┣', rightT: '┫', topT: '┳', bottomT: '┻', cross: '╋'
  }
};

// Status icons with colors
const statusIcons = {
  start: `${colors.fgBrightGreen}🚀${colors.reset}`,
  success: `${colors.fgBrightGreen}✓${colors.reset}`,
  error: `${colors.fgBrightRed}✗${colors.reset}`,
  warning: `${colors.fgBrightYellow}⚠${colors.reset}`,
  info: `${colors.fgBrightBlue}ℹ${colors.reset}`,
  debug: `${colors.fgBrightMagenta}🔍${colors.reset}`,
  stop: `${colors.fgBrightRed}⛔${colors.reset}`,
  waiting: `${colors.fgBrightYellow}⏳${colors.reset}`,
  database: `${colors.fgBrightCyan}🗄️${colors.reset}`,
  route: `${colors.fgBrightYellow}🛣️${colors.reset}`,
  security: `${colors.fgBrightMagenta}🔒${colors.reset}`,
  user: `${colors.fgBrightBlue}👤${colors.reset}`,
  config: `${colors.fgBrightCyan}⚙️${colors.reset}`,
  api: `${colors.fgBrightGreen}🔌${colors.reset}`,
  webhook: `${colors.fgBrightMagenta}🪝${colors.reset}`,
  socket: `${colors.fgBrightBlue}🔌${colors.reset}`,
  time: `${colors.fgBrightYellow}⏱️${colors.reset}`,
  memory: `${colors.fgBrightGreen}📊${colors.reset}`,
  cache: `${colors.fgBrightCyan}📦${colors.reset}`,
  notification: `${colors.fgBrightYellow}🔔${colors.reset}`,
  bye: `${colors.fgBrightCyan}👋${colors.reset}`
};

// Helper functions
function getTime(format = 'HH:MM:SS') {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
  switch (format) {
    case 'HH:MM':
      return `${hours}:${minutes}`;
    case 'HH:MM:SS.MS':
      return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    case 'HH:MM:SS':
    default:
      return `${hours}:${minutes}:${seconds}`;
  }
}

function getSystemInfo() {
  const totalMem = Math.round(os.totalmem() / (1024 * 1024 * 1024) * 10) / 10;
  const freeMem = Math.round(os.freemem() / (1024 * 1024 * 1024) * 10) / 10;
  const usedMem = Math.round((totalMem - freeMem) * 10) / 10;
  const memUsagePercent = Math.round((usedMem / totalMem) * 100);
  
  return {
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    cpus: os.cpus().length,
    uptime: Math.floor(os.uptime() / 60), // minutes
    memory: {
      total: totalMem,
      free: freeMem,
      used: usedMem,
      usagePercent: memUsagePercent
    }
  };
}

function getMemoryUsage() {
  const used = process.memoryUsage();
  return {
    rss: Math.round(used.rss / (1024 * 1024) * 10) / 10, // Resident Set Size in MB
    heapTotal: Math.round(used.heapTotal / (1024 * 1024) * 10) / 10, // Total Size of the Heap in MB
    heapUsed: Math.round(used.heapUsed / (1024 * 1024) * 10) / 10, // Heap actually Used in MB
    external: Math.round((used.external || 0) / (1024 * 1024) * 10) / 10, // Memory used by C++ objects bound to JS
    arrayBuffers: Math.round((used.arrayBuffers || 0) / (1024 * 1024) * 10) / 10 // Memory for ArrayBuffers and SharedArrayBuffers
  };
}

// Gradient text function with multiple gradient options
function gradientText(text, gradientType = 'rainbow') {
  let gradientColors;
  
  switch (gradientType) {
    case 'sunset':
      gradientColors = colors.sunset;
      break;
    case 'ocean':
      gradientColors = colors.ocean;
      break;
    case 'forest':
      gradientColors = colors.forest;
      break;
    case 'neon':
      gradientColors = colors.neon;
      break;
    case 'rainbow':
    default:
      gradientColors = colors.rainbow;
      break;
  }
  
  let result = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ') {
      result += ' '; // Keep spaces without color codes
    } else {
      const colorIndex = i % gradientColors.length;
      result += gradientColors[colorIndex] + text[i];
    }
  }
  return result + colors.reset;
}

// Create boxed text with various styles
function getBoxedText(lines, options = {}) {
  const {
    boxStyle = 'heavy',
    paddingX = 2,
    paddingY = 0,
    titleAlignment = 'center',
    textAlignment = 'left',
    borderColor = colors.fgCyan,
    backgroundColor = '',
    textColor = '',
    title = '',
    width = null,
    shadowEffect = false
  } = options;
  
  // Select box style
  const boxChars = box[boxStyle] || box.single;
  
  // Calculate maximum width
  const contentLines = Array.isArray(lines) ? lines : [lines];
  const strippedLines = contentLines.map(line => line.replace(/\x1b\[[0-9;]*m/g, ''));
  const titleLength = title ? title.replace(/\x1b\[[0-9;]*m/g, '').length : 0;
  
  const maxLineLength = Math.max(
    ...strippedLines.map(line => line.length),
    titleLength
  );
  
  const actualWidth = width || maxLineLength + (paddingX * 2);
  
  // Build the box
  let result = [];

  // Shadow effect
  const shadowOffset = shadowEffect ? 1 : 0;
  
  // Top border with title if provided
  if (title) {
    const titlePadded = title.padStart(
      Math.floor((actualWidth - titleLength) / 2) + titleLength, 
      ' '
    ).padEnd(actualWidth, ' ');
    
    result.push(
      `${borderColor}${boxChars.topLeft}${boxChars.horizontal.repeat(Math.floor((actualWidth - titleLength) / 2) - 1)}` +
      `${textColor || colors.fgBrightWhite}${title}${borderColor}` +
      `${boxChars.horizontal.repeat(actualWidth - titleLength - Math.floor((actualWidth - titleLength) / 2) + 1)}` +
      `${boxChars.topRight}${colors.reset}`
    );
  } else {
    result.push(`${borderColor}${boxChars.topLeft}${boxChars.horizontal.repeat(actualWidth)}${boxChars.topRight}${colors.reset}`);
  }
  
  // Top padding
  for (let i = 0; i < paddingY; i++) {
    result.push(`${borderColor}${boxChars.vertical}${backgroundColor}${' '.repeat(actualWidth)}${colors.reset}${borderColor}${boxChars.vertical}${colors.reset}`);
  }
  
  // Content lines
  contentLines.forEach(line => {
    const strippedLine = line.replace(/\x1b\[[0-9;]*m/g, '');
    let paddedLine;
    
    if (textAlignment === 'center') {
      const padding = Math.floor((actualWidth - strippedLine.length) / 2);
      paddedLine = ' '.repeat(padding) + line + ' '.repeat(actualWidth - strippedLine.length - padding);
    } else if (textAlignment === 'right') {
      paddedLine = ' '.repeat(actualWidth - strippedLine.length) + line;
    } else { // left alignment
      paddedLine = line + ' '.repeat(actualWidth - strippedLine.length);
    }
    
    result.push(`${borderColor}${boxChars.vertical}${backgroundColor}${textColor}${paddedLine}${colors.reset}${borderColor}${boxChars.vertical}${colors.reset}`);
  });
  
  // Bottom padding
  for (let i = 0; i < paddingY; i++) {
    result.push(`${borderColor}${boxChars.vertical}${backgroundColor}${' '.repeat(actualWidth)}${colors.reset}${borderColor}${boxChars.vertical}${colors.reset}`);
  }
  
  // Bottom border
  result.push(`${borderColor}${boxChars.bottomLeft}${boxChars.horizontal.repeat(actualWidth)}${boxChars.bottomRight}${colors.reset}`);
  
  // Add shadow effect if enabled
  if (shadowEffect) {
    // Add shadow to the right side (except for the last line which already has shadow)
    for (let i = 0; i < result.length - 1; i++) {
      result[i] += `${colors.dim}${colors.fgBlack}${' '.repeat(shadowOffset)}${colors.reset}`;
    }
    
    // Add the bottom shadow line
    const bottomShadow = `${' '.repeat(shadowOffset)}${colors.dim}${colors.fgBlack}${' '.repeat(actualWidth + 2 + shadowOffset)}${colors.reset}`;
    result.push(bottomShadow);
  }
  
  return result.join('\n');
}

// Create progress bar
function progressBar(current, total, options = {}) {
  const {
    width = 30,
    completeChar = '█',
    incompleteChar = '░',
    barColor = colors.fgGreen,
    textColor = colors.fgWhite,
    showPercentage = true,
    showValue = false
  } = options;
  
  const percentage = Math.min(100, Math.round((current / total) * 100));
  const completedWidth = Math.floor((percentage / 100) * width);
  
  let bar = `${barColor}${completeChar.repeat(completedWidth)}${colors.fgBrightBlack}${incompleteChar.repeat(width - completedWidth)}${colors.reset}`;
  
  if (showPercentage && showValue) {
    return `${bar} ${textColor}${percentage}%${colors.reset} (${current}/${total})`;
  } else if (showPercentage) {
    return `${bar} ${textColor}${percentage}%${colors.reset}`;
  } else if (showValue) {
    return `${bar} ${textColor}(${current}/${total})${colors.reset}`;
  }
  
  return bar;
}


// Text animation functions
function typeWriter(text, options = {}) {
  const {
    speed = 20,
    color = '',
    endCallback = null
  } = options;
  
  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      process.stdout.write(color + text[i] + colors.reset);
      i++;
    } else {
      clearInterval(interval);
      process.stdout.write('\n');
      if (endCallback) endCallback();
    }
  }, speed);
}

function animateLine(text, options = {}) {
  const {
    type = 'typewriter', // 'typewriter', 'fade', 'slide'
    color = '',
    speed = 20,
    endCallback = null
  } = options;
  
  if (type === 'typewriter') {
    typeWriter(text, { speed, color, endCallback });
  } else if (type === 'slide') {
    // Slide in text from right
    const width = process.stdout.columns || 80;
    let pos = width - 1;
    
    const interval = setInterval(() => {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      
      const visiblePart = text.substring(0, Math.max(0, text.length - pos));
      const spaces = ' '.repeat(Math.max(0, pos));
      
      process.stdout.write(color + spaces + visiblePart + colors.reset);
      
      pos -= 1;
      if (pos < 0) {
        clearInterval(interval);
        process.stdout.write('\n');
        if (endCallback) endCallback();
      }
    }, speed);
  } else if (type === 'fade') {
    // Simple fade in using dim
    const steps = 5;
    let step = 0;
    
    const interval = setInterval(() => {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      
      switch (step) {
        case 0:
          process.stdout.write(`${colors.dim}${colors.fgBrightBlack}${text}${colors.reset}`);
          break;
        case 1:
          process.stdout.write(`${colors.fgBrightBlack}${text}${colors.reset}`);
          break;
        case 2:
          process.stdout.write(`${colors.fgWhite}${text}${colors.reset}`);
          break;
        case 3:
          process.stdout.write(`${colors.bright}${colors.fgWhite}${text}${colors.reset}`);
          break;
        case 4:
          process.stdout.write(`${color}${text}${colors.reset}`);
          break;
      }
      
      step += 1;
      if (step >= steps) {
        clearInterval(interval);
        process.stdout.write('\n');
        if (endCallback) endCallback();
      }
    }, speed * 5);
  }
}


function table(data, options = {}) {
  const {
    headerColor = colors.fgBrightCyan,
    borderColor = colors.fgBrightBlack,
    textColor = colors.fgWhite,
    alignments = [],
    padding = 1
  } = options;
  
  if (!data || !data.length) return '';
  
  // Extract headers from the first row
  const headers = Object.keys(data[0]);
  
  // Calculate column widths
  const columnWidths = {};
  headers.forEach(header => {
    columnWidths[header] = header.length;
    data.forEach(row => {
      const cellValue = String(row[header] || '');
      const strippedValue = cellValue.replace(/\x1b\[[0-9;]*m/g, '');
      columnWidths[header] = Math.max(columnWidths[header], strippedValue.length);
    });
  });
  
  // Add padding to column widths
  headers.forEach(header => {
    columnWidths[header] += padding * 2;
  });
  
  // Create header row
  let tableString = `${borderColor}┌`;
  headers.forEach((header, idx) => {
    tableString += `${borderColor}${'─'.repeat(columnWidths[header])}`;
    if (idx < headers.length - 1) {
      tableString += '┬';
    }
  });
  tableString += `┐${colors.reset}\n`;
  
  // Add column headers
  tableString += `${borderColor}│${colors.reset}`;
  headers.forEach((header, idx) => {
    const alignment = alignments[idx] || 'left';
    let formattedHeader;
    
    if (alignment === 'center') {
      const padding = Math.floor((columnWidths[header] - header.length) / 2);
      formattedHeader = ' '.repeat(padding) + header + ' '.repeat(columnWidths[header] - header.length - padding);
    } else if (alignment === 'right') {
      formattedHeader = ' '.repeat(columnWidths[header] - header.length) + header;
    } else { // left alignment
      formattedHeader = header + ' '.repeat(columnWidths[header] - header.length);
    }
    
    tableString += `${headerColor}${formattedHeader}${colors.reset}${borderColor}│${colors.reset}`;
  });
  tableString += '\n';
  
  // Add separator
  tableString += `${borderColor}├`;
  headers.forEach((header, idx) => {
    tableString += `${borderColor}${'─'.repeat(columnWidths[header])}`;
    if (idx < headers.length - 1) {
      tableString += '┼';
    }
  });
  tableString += `┤${colors.reset}\n`;
  
  // Add data rows
  data.forEach(row => {
    tableString += `${borderColor}│${colors.reset}`;
    headers.forEach((header, idx) => {
      const cellValue = String(row[header] || '');
      const strippedValue = cellValue.replace(/\x1b\[[0-9;]*m/g, '');
      const alignment = alignments[idx] || 'left';
      let formattedCell;
      
      if (alignment === 'center') {
        const padding = Math.floor((columnWidths[header] - strippedValue.length) / 2);
        formattedCell = ' '.repeat(padding) + cellValue + ' '.repeat(columnWidths[header] - strippedValue.length - padding);
      } else if (alignment === 'right') {
        formattedCell = ' '.repeat(columnWidths[header] - strippedValue.length) + cellValue;
      } else { // left alignment
        formattedCell = cellValue + ' '.repeat(columnWidths[header] - strippedValue.length);
      }
      
      tableString += `${textColor}${formattedCell}${colors.reset}${borderColor}│${colors.reset}`;
    });
    tableString += '\n';
  });
  
  // Add bottom border
  tableString += `${borderColor}└`;
  headers.forEach((header, idx) => {
    tableString += `${borderColor}${'─'.repeat(columnWidths[header])}`;
    if (idx < headers.length - 1) {
      tableString += '┴';
    }
  });
  tableString += `┘${colors.reset}`;
  
  return tableString;
}

  function logServerStart(port, appName = "Express Server") {
    const sys = getSystemInfo();
    const mem = getMemoryUsage();
  
    // ASCII Art ly cafe
    const coffeeArt = [
      "      ",
      `${colors.fgBrightYellow}       ( (     ${colors.reset}`,
      `${colors.fgBrightYellow}        ) )    ${colors.reset}`,
      `${colors.fgBrightYellow}     ........  ${colors.reset}`,
      `${colors.fgBrightYellow}     |      |] ${colors.reset}`,
      `${colors.fgBrightYellow}     \\      /  ${colors.reset}`,
      `${colors.fgBrightYellow}      \`----'   ${colors.reset}`,
      ""
    ].join('\n');

    const title = gradientText(`🚀 ${appName} STARTED!`, "rainbow");
    const boxContent = [
      coffeeArt,
      title,
      "",
      `${statusIcons.start} ${colors.fgBrightGreen}Port:${colors.reset} ${port}`,
      `${statusIcons.route} ${colors.fgBrightCyan}Docs:${colors.reset} http://localhost:${port}/api-docs`,
      "",
      table([
        { Info: "Host", Value: sys.hostname },
        { Info: "Platform", Value: `${sys.platform} (${sys.arch})` },
        { Info: "CPU cores", Value: sys.cpus },
        { Info: "Uptime (min)", Value: sys.uptime },
        { Info: "Total RAM (GB)", Value: sys.memory.total },
        { Info: "Used RAM (GB)", Value: sys.memory.used },
        { Info: "RAM Usage (%)", Value: sys.memory.usagePercent },
        { Info: "Heap Used (MB)", Value: mem.heapUsed },
        { Info: "RSS (MB)", Value: mem.rss }
      ], {
        headerColor: colors.fgBrightYellow,
        textColor: colors.fgWhite,
        borderColor: colors.fgBrightBlack,
        alignments: ["left", "right"]
      })
    ];
  
    console.log(getBoxedText(boxContent, {
      boxStyle: "rounded",
      paddingX: 0,
      paddingY: 0,
      borderColor: colors.fgBrightMagenta,
      textColor: colors.fgBrightWhite,
      title: gradientText("SERVER ONLINE", "neon"),
      shadowEffect: true
    }));
  
    animateLine("✨ Welcome to your beautiful server! ✨", { type: "typewriter", color: colors.fgBrightGreen, speed: 18 });
  }
  
  
  function logServerStop() {
    const boxContent = [
      gradientText("⛔ SERVER STOPPED", "sunset"),
      "",
      `${statusIcons.bye} ${colors.fgBrightCyan}Goodbye!${colors.reset}`,
      `${statusIcons.time} ${colors.fgBrightYellow}${getTime("HH:MM:SS")}${colors.reset}`
    ];
    console.log(getBoxedText(boxContent, {
      boxStyle: "heavy",
      paddingX: 4,
      paddingY: 1,
      borderColor: colors.fgBrightRed,
      textColor: colors.fgBrightWhite,
      title: gradientText("SERVER OFFLINE", "rainbow"),
      shadowEffect: true
    }));
    animateLine("👋 See you next time!", { type: "slide", color: colors.fgBrightCyan, speed: 8 });
  }
  
  function showMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    const format = (bytes) => `${Math.round(bytes / 1024 / 1024 * 100) / 100} MB`;
    
    const lines = [
      `${colors.fgCyan}Memory Usage:${colors.reset}`,
      `RSS: ${format(memoryUsage.rss)}`,
      `Heap Total: ${format(memoryUsage.heapTotal)}`,
      `Heap Used: ${format(memoryUsage.heapUsed)}`,
      `External: ${format(memoryUsage.external)}`
    ];
  
    // Sửa: Dùng getBoxedText trực tiếp thay vì this.getBoxedText
    console.log(getBoxedText(lines, {
      borderColor: colors.fgBlue,
      title: ' MEMORY '
    }));
  }

  module.exports = {
    getTime,
    getSystemInfo,
    getMemoryUsage,
    gradientText,
    getBoxedText,
    progressBar,
    typeWriter,
    animateLine,
    table,
    logServerStart,
    logServerStop,
    showMemoryUsage
  };
  