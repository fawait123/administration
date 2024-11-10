export const formatRupiah = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

export const numberToTextRupiah = (number: number): string => {
    const units = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"];
    const tens = ["", "sepuluh", "dua puluh", "tiga puluh", "empat puluh", "lima puluh", "enam puluh", "tujuh puluh", "delapan puluh", "sembilan puluh"];
    const teens = ["sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas", "enam belas", "tujuh belas", "delapan belas", "sembilan belas"];
    const thousands = ["", "ribu", "juta", "miliar", "triliun"];

    if (number === 0) return "nol rupiah";

    function getHundreds(num) {
        let text = "";
        if (num >= 100) {
            if (num < 200) {
                text += "seratus";
            } else {
                text += units[Math.floor(num / 100)] + " ratus";
            }
            num %= 100;
        }
        if (num >= 10 && num < 20) {
            text += (text ? " " : "") + teens[num - 10];
            num = 0;
        } else if (num >= 20) {
            text += (text ? " " : "") + tens[Math.floor(num / 10)];
            num %= 10;
        }
        if (num > 0) {
            text += (text ? " " : "") + units[num];
        }
        return text;
    }

    let result = "";
    let thousandLevel = 0;

    while (number > 0) {
        const remainder = number % 1000;
        if (remainder !== 0) {
            let part = getHundreds(remainder);
            if (thousandLevel > 0) {
                if (remainder === 1 && thousandLevel === 1) {
                    part = "seribu";
                } else {
                    part += " " + thousands[thousandLevel];
                }
            }
            result = part + (result ? " " + result : "");
        }
        number = Math.floor(number / 1000);
        thousandLevel++;
    }

    return result.trim() + " rupiah";
}