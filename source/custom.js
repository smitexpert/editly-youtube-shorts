import editly from "editly"
import { fabric } from 'fabric';
import { getPositionProps, getFrameByKeyFrames, isUrl } from './util.js';
import { easeOutExpo, easeInOutCubic } from './transitions.js';

const defaultFontFamily = 'Rubik';
const PacificoPath = './fonts/Rubik-Bold.ttf'
// fabric.fontPaths = { Pacifico: '../fonts/Pacifico-Regular.ttf' }


fabric.nodeCanvas.registerFont(PacificoPath, {family: "Rubik"});

export async function slideInTextFrameSource({ width, height, params }) {
    
    const { text, textColor = '#ffffff', fontFamily = defaultFontFamily, position = 'center', zoomDirection = 'in', zoomAmount = 0.2, strokeStyle = 'white', strokeWidth = 1, fontSize = 0.05, charSpacing = 0.01, fillStyle="black", lineHeight = 1.1  } = params;

    async function onRender(progress, canvas) {
      const fontSizeAbs = Math.round(width * fontSize);
  
      const { left, top, originX, originY } = getPositionProps({ position, width, height });

      const shadow = new fabric.Shadow({
        color: 'black',
        blur: 5
    })
  
      const textBox = new fabric.Textbox(text, {
        fill: textColor,
        fontFamily,
        fontSize: fontSizeAbs,
        fontWeight: 1200,
        charSpacing: width * charSpacing,
        width: width * 0.8,
        stroke: true,
        strokeStyle: strokeStyle,
        strokeWidth: strokeWidth,
        textAlign: 'center',
        lineHeight: lineHeight,
        shadow: shadow
      });
  
      const { opacity, textSlide } = getFrameByKeyFrames([
        { t: 0.1, props: { opacity: 1, textSlide: 0 } },
        { t: 0.3, props: { opacity: 1, textSlide: 1 } },
        { t: 0.8, props: { opacity: 1, textSlide: 1 } },
        { t: 0.9, props: { opacity: 0, textSlide: 1 } },
      ], progress);
  
      const fadedObject = await getFadedObject({ object: textBox, progress: easeInOutCubic(textSlide) });
      fadedObject.setOptions({
        originX,
        originY,
        top,
        left,
        opacity,
      });
  
      canvas.add(fadedObject);
    }
  
    return { onRender };
}

export async function titleFrameSource({ width, height, params }) {
  const { text, textColor = '#ffffff', fontFamily = defaultFontFamily, fontSize = 0.05, position = 'center', zoomDirection = 'in', zoomAmount = 0.2 } = params;

  async function onRender(progress, canvas) {
    // console.log('progress', progress);

    const min = Math.min(width, height);

    const fontSizeAbs = Math.round(width * fontSize);

    // const scaleFactor = getZoomParams({ progress, zoomDirection, zoomAmount });

    // const translationParams = getTranslationParams({ progress, zoomDirection, zoomAmount });

    const textBox = new fabric.Textbox(text, {
      fill: textColor,
      fontFamily,
      fontSize: fontSizeAbs,
      textAlign: 'center',
      width: width * 0.8,
      stroke: true,
      strokeStyle: "white",
      strokeWidth: 2
    });

    // We need the text as an image in order to scale it
    const textImage = await new Promise((r) => textBox.cloneAsImage(r));

    const { left, top, originX, originY } = getPositionProps({ position, width, height });

    textImage.set({
      originX,
      originY,
      left: left,
      top,
    });
    canvas.add(textImage);
  }

  return { onRender };
}


async function getFadedObject({ object, progress }) {
  const rect = new fabric.Rect({
    left: 0,
    width: object.width,
    height: object.height,
    top: 0,
  });

  rect.set('fill', new fabric.Gradient({
    coords: {
      x1: 0,
      y1: 0,
      x2: object.width,
      y2: 0,
    },
    colorStops: [
      { offset: Math.max(0, (progress * (1 + 0.2)) - 0.2), color: 'rgba(255,255,255,1)' },
      { offset: Math.min(1, (progress * (1 + 0.2))), color: 'rgba(255,255,255,0)' },
    ],
  }));

  const gradientMaskImg = await new Promise((r) => rect.cloneAsImage(r));
  const fadedImage = await new Promise((r) => object.cloneAsImage(r));

  fadedImage.filters.push(new fabric.Image.filters.BlendImage({
    image: gradientMaskImg,
    mode: 'multiply',
  }));

  fadedImage.applyFilters();

  return fadedImage;
}

export async function newTitleFrameSource({ width, height, params }) {
  const { text, textColor = '#000000', backgroundColor = "rgb(255,255,255)", position = 'center', fontFamily = defaultFontFamily, fontSize = 0.05, delay = 0, speed = 1 } = params;

  async function onRender(progress, canvas) {
    const min = Math.min(width, height);

    const fontSizeAbs = Math.round(min * fontSize);

    const easedBgProgress = easeOutExpo(Math.max(0, Math.min((progress - delay) * speed * 3, 1)));
    const easedTextProgress = easeOutExpo(Math.max(0, Math.min((progress - delay - 0.02) * speed * 4, 1)));
    const easedTextOpacityProgress = easeOutExpo(Math.max(0, Math.min((progress - delay - 0.07) * speed * 4, 1)));

    const top = height * 0.28;

    const paddingV = 0.04 * min;
    const paddingH = 0.03 * min;

    const { left, originX, originY } = getPositionProps({ position, width, height });

    const textBox = new fabric.Text(text, {
      top: top - paddingH,
      left,
      originX,
      originY,
      fill: textColor,
      fontFamily,
      fontWeight: 800,
      fontSize: fontSizeAbs,
      charSpacing: width * 0.01,
    });


    const bgWidth = textBox.width + (paddingV * 2);
    const rect = new fabric.Rect({
      top: top - paddingH,
      left,
      originX,
      originY,
      width: bgWidth,
      height: textBox.height + (paddingH * 2),
      fill: backgroundColor,
      rx: 10,
      ry: 10
    });

    canvas.add(rect);
    canvas.add(textBox);
  }

  return { onRender };
}

export async function waterMarkText({ width, height, params }) {
  const { text, textColor = '#ffffff', fontFamily = defaultFontFamily, fontSize = 0.05, position = 'center', zoomDirection = 'in', zoomAmount = 0.2 } = params;

  async function onRender(progress, canvas) {
    // console.log('progress', progress);

    const min = Math.min(width, height);

    const fontSizeAbs = Math.round(width * fontSize);

    // const scaleFactor = getZoomParams({ progress, zoomDirection, zoomAmount });

    // const translationParams = getTranslationParams({ progress, zoomDirection, zoomAmount });

    const textBox = new fabric.Textbox(text, {
      fill: textColor,
      fontFamily,
      fontSize: fontSizeAbs,
      textAlign: 'center',
      width: width * 0.8,
      stroke: true,
      strokeStyle: "white",
      strokeWidth: 2,
      opacity: 0.3
    });

    // We need the text as an image in order to scale it
    const textImage = await new Promise((r) => textBox.cloneAsImage(r));

    const top = height * 0.8;

    const { left, originX, originY } = getPositionProps({ position, width, height });

    textImage.set({
      originX,
      originY,
      left: left,
      top,
    });
    canvas.add(textImage);
  }

  return { onRender };
}

function getZoomParams({ progress, zoomDirection, zoomAmount }) {
  let scaleFactor = 1;
  if (zoomDirection === 'left' || zoomDirection === 'right') return 1.3 + zoomAmount;
  if (zoomDirection === 'in') scaleFactor = (1 + zoomAmount * progress);
  else if (zoomDirection === 'out') scaleFactor = (1 + zoomAmount * (1 - progress));
  return scaleFactor;
}

function getTranslationParams({ progress, zoomDirection, zoomAmount }) {
  let translation = 0;
  const range = zoomAmount * 1000;

  if (zoomDirection === 'right') translation = (progress) * range - range / 2;
  else if (zoomDirection === 'left') translation = -((progress) * range - range / 2);

  return translation;
}

// module.exports = { slideInTextFrameSource };