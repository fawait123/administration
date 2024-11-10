export function formatNumber(input: string) {
    const num = parseFloat(input.replace(/\./g, '')); // Menghapus titik dan mengubah string menjadi angka

    return num < 0 ? `minus ${Math.abs(num).toLocaleString('id')}` : `${num.toLocaleString('id')}`;
}
