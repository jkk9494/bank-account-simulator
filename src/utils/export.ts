import html2canvas from 'html2canvas';

/**
 * 특정 요소를 캡처하여 PNG 파일로 다운로드합니다.
 * 워터마크(날짜, 기간)를 캔버스에 직접 그려서 삽입합니다.
 */
export async function exportToImage(elementId: string, filename: string, periodText: string) {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const canvas = await html2canvas(element, {
            backgroundColor: '#f9fafb', // bg-gray-50
            scale: 2, // 고화질 출력
            useCORS: true,
            logging: false,
        });

        const ctx = canvas.getContext('2d');
        if (ctx) {
            const now = new Date();
            const dateText = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            // 워터마크 스타일 설정
            ctx.font = 'bold 24px Pretendard, sans-serif';
            ctx.fillStyle = 'rgba(139, 149, 161, 0.5)'; // gray-500 with opacity

            // 워터마크 위치 (좌측 상단)
            ctx.fillText(`통장 쪼개기 시뮬레이터`, 40, 60);

            ctx.font = '18px Pretendard, sans-serif';
            ctx.fillText(`생성일: ${dateText}`, 40, 95);
            ctx.fillText(`설정 기간: ${periodText}`, 40, 125);
        }

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${filename}_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error('이미지 저장 중 오류 발생:', error);
        alert('이미지 저장에 실패했습니다.');
    }
}
