import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";

const needOptions = [
  { value: "exam", label: "Luyện thi" },
  { value: "support", label: "Bổ trợ kiến thức" },
  { value: "advanced", label: "Nâng cao" },
  { value: "other", label: "Khác" }
];

const timeOptions = [
  { value: "morning", label: "Sáng (8h - 12h)" },
  { value: "afternoon", label: "Chiều (14h - 17h)" },
  { value: "evening", label: "Tối (18h - 21h)" },
  { value: "weekend", label: "Cuối tuần" }
];

export function ContactSection() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    need: "",
    time: "",
    note: ""
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    if (!agreed) {
      newErrors.agreed = "Vui lòng đồng ý để nhận tư vấn";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Đã gửi yêu cầu thành công!",
      description: "Trung tâm sẽ liên hệ với bạn trong vòng 24 giờ.",
    });

    // Reset form
    setFormData({ name: "", email: "", phone: "", need: "", time: "", note: "" });
    setAgreed(false);
    setIsLoading(false);
  };

  return (
    <section id="contact" className="section-padding">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider mb-4 block">
              Liên hệ tư vấn
            </span>
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Nhận tư vấn miễn phí
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Để lại thông tin, chúng tôi sẽ liên hệ tư vấn lộ trình học phù hợp 
              với con bạn trong vòng 24 giờ.
            </p>

            <div className="space-y-4 text-muted-foreground">
              <p>📍 123 Đường ABC, Quận XYZ, TP.HCM</p>
              <p>📞 Hotline: 1900 1234</p>
              <p>✉️ Email: contact@educenter.vn</p>
              <p>🕐 Giờ làm việc: 8h - 21h (T2 - CN)</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-accent/50 rounded-2xl p-8 border border-border">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <Label htmlFor="name" className="text-foreground font-medium">
                  Họ tên <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Nhập họ tên"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`mt-1.5 ${errors.name ? 'border-destructive' : ''}`}
                />
                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`mt-1.5 ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-foreground font-medium">
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              {/* Need & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground font-medium">Nhu cầu</Label>
                  <Select value={formData.need} onValueChange={(v) => setFormData({ ...formData, need: v })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn nhu cầu" />
                    </SelectTrigger>
                    <SelectContent>
                      {needOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-foreground font-medium">Khung giờ</Label>
                  <Select value={formData.time} onValueChange={(v) => setFormData({ ...formData, time: v })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn khung giờ" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Note */}
              <div>
                <Label htmlFor="note" className="text-foreground font-medium">Ghi chú</Label>
                <Textarea
                  id="note"
                  placeholder="Thông tin thêm về nhu cầu học tập..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="mt-1.5 min-h-[100px]"
                />
              </div>

              {/* Checkbox */}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="agree"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="agree" className="text-sm text-muted-foreground cursor-pointer">
                  Tôi đồng ý nhận tư vấn từ EduCenter
                </Label>
              </div>
              {errors.agreed && <p className="text-destructive text-sm -mt-3">{errors.agreed}</p>}

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full btn-primary h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Gửi yêu cầu tư vấn
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
