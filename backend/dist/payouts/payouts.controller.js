"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutsController = void 0;
const common_1 = require("@nestjs/common");
const payouts_service_1 = require("./payouts.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PayoutsController = class PayoutsController {
    payouts;
    constructor(payouts) {
        this.payouts = payouts;
    }
    corridors() {
        return this.payouts.getCorridors();
    }
    quote(body) {
        return this.payouts.quote(body);
    }
    listBeneficiaries(req) {
        return this.payouts.listBeneficiaries(req.user.id);
    }
    createBeneficiary(req, body) {
        return this.payouts.createBeneficiary(req.user.id, body);
    }
    create(req, body) {
        return this.payouts.createPayout(req.user.id, body);
    }
    list(req, page, limit) {
        return this.payouts.listPayouts(req.user.id, Number(page) || 1, Number(limit) || 10);
    }
    one(req, reference) {
        return this.payouts.getPayout(req.user.id, reference);
    }
};
exports.PayoutsController = PayoutsController;
__decorate([
    (0, common_1.Get)('corridors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "corridors", null);
__decorate([
    (0, common_1.Post)('quote'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "quote", null);
__decorate([
    (0, common_1.Get)('beneficiaries'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "listBeneficiaries", null);
__decorate([
    (0, common_1.Post)('beneficiaries'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "createBeneficiary", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':reference'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "one", null);
exports.PayoutsController = PayoutsController = __decorate([
    (0, common_1.Controller)('payouts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [payouts_service_1.PayoutsService])
], PayoutsController);
//# sourceMappingURL=payouts.controller.js.map