import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export const generateProjectPDF = (settings, rooms) => {
    const doc = new jsPDF();
    const { businessName, phoneNumber, email } = settings;

    // --- Page 1: Project Summary ---

    // Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text(businessName || "FloorSnap Contractor", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Project Quote", 20, 26);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 32);

    // Contact Info
    if (phoneNumber || email) {
        let contactY = 38;
        if (phoneNumber) {
            doc.text(`Phone: ${phoneNumber}`, 20, contactY);
            contactY += 5;
        }
        if (email) {
            doc.text(`Email: ${email}`, 20, contactY);
        }
    }

    let yPos = 50;

    // Project Summary Table
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Project Summary", 20, yPos);
    yPos += 8;

    const summaryBody = rooms.map(room => [
        room.name,
        room.materialType,
        `${room.sqft.toLocaleString()} sq ft`,
        formatCurrency(room.totalCost)
    ]);

    // Calculate Totals
    const totalSqft = rooms.reduce((sum, room) => sum + room.sqft, 0);
    const totalCost = rooms.reduce((sum, room) => sum + room.totalCost, 0);

    summaryBody.push([
        { content: 'Total', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: formatCurrency(totalCost), styles: { fontStyle: 'bold' } }
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Room', 'Material', 'Area', 'Est. Cost']],
        body: summaryBody,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        footStyles: { fillColor: [241, 245, 249], textColor: 0, fontStyle: 'bold' }
    });

    // --- Room Details Pages ---
    rooms.forEach((room, index) => {
        doc.addPage();
        yPos = 20;

        // Room Header
        doc.setFontSize(18);
        doc.setTextColor(37, 99, 235);
        doc.text(`Room: ${room.name}`, 20, yPos);
        yPos += 10;

        // Room Image
        if (room.image) {
            try {
                const imgProps = doc.getImageProperties(room.image);
                const pdfWidth = 170;
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                // Limit height
                const finalHeight = Math.min(pdfHeight, 120);
                const finalWidth = (imgProps.width * finalHeight) / imgProps.height;

                doc.addImage(room.image, 'JPEG', 20, yPos, finalWidth, finalHeight);
                yPos += finalHeight + 10;
            } catch (e) {
                console.error(`Error adding image for room ${room.name}`, e);
            }
        }

        // Room Details Table
        autoTable(doc, {
            startY: yPos,
            head: [['Detail', 'Value']],
            body: [
                ['Dimensions', room.isManualInput ? 'Manual Input' : `${room.width} ft x ${room.length} ft`],
                ['Shape', room.roomShape],
                ['Material', room.materialType],
                ['Waste Factor', `${(room.wasteFactor * 100).toFixed(0)}%`],
                ['Material Cost', formatCurrency(room.materialCostPerSqFt) + ' / sq ft'],
                ['Labor Cost', formatCurrency(room.laborCostPerSqFt) + ' / sq ft'],
                ['Room Total', formatCurrency(room.totalCost)],
            ],
            theme: 'grid',
            headStyles: { fillColor: [100, 116, 139] }, // Slate-500
        });
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save("FloorSnap_Project_Quote.pdf");
};
