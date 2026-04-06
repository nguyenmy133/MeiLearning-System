// Utility to generate VietQR bank transfer QR code
// Format: https://api.vietqr.io/v2/generate

export interface BankInfo {
    bankId: string; // Bank code (e.g., "970422" for MB Bank)
    accountNo: string;
    accountName: string;
}

export interface PaymentInfo {
    amount: number;
    description: string; // Payment description/note
    addInfo?: string; // Additional info
}

/**
 * Generate VietQR URL for bank transfer
 * @param bankInfo - Bank account information
 * @param paymentInfo - Payment details
 * @returns QR code image URL
 */
export function generateVietQR(bankInfo: BankInfo, paymentInfo: PaymentInfo): string {
    const { bankId, accountNo, accountName } = bankInfo;
    const { amount, description, addInfo } = paymentInfo;

    // VietQR API endpoint
    const baseUrl = "https://img.vietqr.io/image";

    // Build URL with parameters
    const params = new URLSearchParams({
        accountNo,
        accountName,
        acqId: bankId,
        amount: amount.toString(),
        addInfo: description + (addInfo ? ` - ${addInfo}` : ""),
    });

    return `${baseUrl}/${bankId}-${accountNo}-compact2.jpg?${params.toString()}`;
}

/**
 * Generate simple QR code data string for bank transfer
 * This can be used with qrcode.react library
 */
export function generateBankQRData(bankInfo: BankInfo, paymentInfo: PaymentInfo): string {
    const { accountNo, accountName } = bankInfo;
    const { amount, description } = paymentInfo;

    // Simple format for QR code
    return JSON.stringify({
        bank: bankInfo.bankId,
        account: accountNo,
        name: accountName,
        amount: amount,
        message: description,
    });
}

/**
 * Format currency to VND
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}

/**
 * Common Vietnamese banks
 */
export const VIETNAMESE_BANKS = [
    { id: "970422", name: "MB Bank", shortName: "MB" },
    { id: "970415", name: "Vietinbank", shortName: "VTB" },
    { id: "970436", name: "Vietcombank", shortName: "VCB" },
    { id: "970418", name: "BIDV", shortName: "BIDV" },
    { id: "970405", name: "Agribank", shortName: "AGB" },
    { id: "970407", name: "Techcombank", shortName: "TCB" },
    { id: "970416", name: "ACB", shortName: "ACB" },
    { id: "970432", name: "VPBank", shortName: "VPB" },
    { id: "970423", name: "TPBank", shortName: "TPB" },
    { id: "970403", name: "Sacombank", shortName: "SCB" },
];

/**
 * Mock center bank account (replace with real data)
 */
export const CENTER_BANK_ACCOUNT: BankInfo = {
    bankId: "970422", // MB Bank
    accountNo: "130320041303",
    accountName: "TRUNG TAM MEILEARNING",
};
