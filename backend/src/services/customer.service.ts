import { customerRepo } from '../repositories/customer.repo';
import { cardRepo } from '../repositories/card.repo';
import { programRepo } from '../repositories/program.repo';
import { NotFoundError, BadRequestError } from '../types';
import { generateQrCode, formatPhone } from '../lib/utils';

export const customerService = {
  async list(merchantId: string) {
    return customerRepo.findByMerchant(merchantId);
  },

  async getById(id: string, merchantId: string) {
    const customer = await customerRepo.findByIdWithCards(id, merchantId);
    if (!customer) throw new NotFoundError('Customer');
    return customer;
  },

  async createWithCard(merchantId: string, phone: string, name: string | null, programId: string) {
    let formattedPhone: string;
    try {
      formattedPhone = formatPhone(phone);
    } catch {
      throw new BadRequestError('Invalid phone number (7-16 digits required)');
    }

    // Verify program belongs to merchant
    const program = await programRepo.findActiveByIdAndMerchant(programId, merchantId);
    if (!program) throw new NotFoundError('Program');

    // Find or create customer
    let customer = await customerRepo.findByPhone(formattedPhone);
    if (!customer) {
      customer = await customerRepo.create({ phone: formattedPhone, name });
    }

    // Check if card already exists
    const existingCard = await cardRepo.findByCustomerAndProgram(customer.id, programId);
    if (existingCard) {
      throw new BadRequestError('Customer already has a card for this program');
    }

    // Generate unique QR code
    let qrCode = generateQrCode();
    while (await cardRepo.findByQrCode(qrCode)) {
      qrCode = generateQrCode();
    }

    return cardRepo.create({ customerId: customer.id, programId, qrCode });
  },

  async createWithCardPublic(merchantId: string, phone: string, name: string | null, programId: string) {
    let formattedPhone: string;
    try {
      formattedPhone = formatPhone(phone);
    } catch {
      throw new BadRequestError('Invalid phone number (7-16 digits required)');
    }

    // Find or create customer
    let customer = await customerRepo.findByPhone(formattedPhone);
    if (!customer) {
      customer = await customerRepo.create({ phone: formattedPhone, name });
    }

    // Check if card already exists
    const existingCard = await cardRepo.findByCustomerAndProgram(customer.id, programId);
    if (existingCard) {
      // Return existing card instead of error for self-service flow
      return existingCard;
    }

    // Generate unique QR code
    let qrCode = generateQrCode();
    while (await cardRepo.findByQrCode(qrCode)) {
      qrCode = generateQrCode();
    }

    return cardRepo.create({ customerId: customer.id, programId, qrCode });
  },
};
