const websiteUrl = 'https://obti.climbersheng.me';
const qrCodeUrl = '/OBTIERWEIMA.png';

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  img.src = src;
});

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
};

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export async function generatePoster(result) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;

  const ctx = canvas.getContext('2d');
  const { personality, analysis, avatarUrl, type } = result;

  ctx.fillStyle = '#F8F9FA';
  ctx.fillRect(0, 0, 1080, 1920);

  ctx.fillStyle = '#0F172A';
  ctx.font = '900 36px "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('OBTI 户外人格测试', 540, 120);

  ctx.fillStyle = '#64748B';
  ctx.font = '400 24px Outfit, "Noto Sans SC", sans-serif';
  ctx.fillText('DISCOVER YOUR OUTDOOR SOUL', 540, 160);

  ctx.beginPath();
  ctx.moveTo(340, 190);
  ctx.lineTo(740, 190);
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1;
  ctx.stroke();

  try {
    const avatarImage = await loadImage(avatarUrl);
    const boxSize = 800;
    const avatarBox = { x: 140, y: 260, width: boxSize, height: boxSize };

    drawRoundedRect(ctx, avatarBox.x, avatarBox.y, avatarBox.width, avatarBox.height, 24);
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.fill();

    const imageRatio = avatarImage.width / avatarImage.height;
    let drawWidth = boxSize;
    let drawHeight = boxSize;
    let drawX = avatarBox.x;
    let drawY = avatarBox.y;

    if (imageRatio > 1) {
      drawWidth = boxSize * imageRatio;
      drawX -= (drawWidth - boxSize) / 2;
    } else {
      drawHeight = boxSize / imageRatio;
      drawY -= (drawHeight - boxSize) / 2;
    }

    ctx.save();
    drawRoundedRect(ctx, avatarBox.x, avatarBox.y, avatarBox.width, avatarBox.height, 24);
    ctx.clip();
    ctx.drawImage(avatarImage, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  } catch {
    ctx.fillStyle = '#E2E8F0';
    drawRoundedRect(ctx, 140, 260, 800, 800, 24);
    ctx.fill();
  }

  ctx.fillStyle = '#065F46';
  ctx.font = '900 120px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${analysis.matchPercent}%`, 540, 1220);

  ctx.fillStyle = '#0F172A';
  ctx.font = '800 64px "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(personality.title, 540, 1310);

  ctx.fillStyle = '#7C3AED';
  ctx.font = '700 34px Outfit, sans-serif';
  ctx.fillText(type, 540, 1370);

  ctx.fillStyle = '#475569';
  ctx.font = '500 30px "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(personality.tags.split(' / ').map((t) => `#${t}`).join('   '), 540, 1420);

  ctx.beginPath();
  ctx.moveTo(140, 1465);
  ctx.lineTo(940, 1465);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = '700 36px "Noto Sans SC", "PingFang SC", "Microsoft YaHei", serif';
  ctx.textAlign = 'left';
  ctx.fillText('核心特质', 140, 1535);

  ctx.fillStyle = '#334155';
  ctx.font = '400 32px "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
  let yPos = 1595;
  analysis.strengths.slice(0, 3).forEach((item) => {
    ctx.fillText(`• ${item.name}`, 140, yPos);
    yPos += 50;
  });

  const qrImage = await loadImage(qrCodeUrl);
  ctx.drawImage(qrImage, 780, 1480, 160, 160);

  ctx.fillStyle = '#64748B';
  ctx.font = '400 24px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('扫码解锁你的户外人格', 860, 1680);

  ctx.fillStyle = '#065F46';
  ctx.font = '400 24px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(websiteUrl, 540, 1850);

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((output) => {
      if (output) resolve(output);
      else reject(new Error('Poster generation failed'));
    }, 'image/png', 0.95);
  });

  return { blob, dataUrl };
}

export async function sharePoster(result) {
  const { blob } = await generatePoster(result);
  const fileName = `OBTI-${result.type}-report.png`;

  if (navigator.share) {
    try {
      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${result.personality.title} | OBTI 户外人格`,
          text: `${result.analysis.summaryText} ${websiteUrl}`,
          files: [file],
        });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
    }
  }

  downloadBlob(blob, fileName);
}

export { websiteUrl };
