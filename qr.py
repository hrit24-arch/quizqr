import qrcode
import secrets
secure_otp=f"{secrets.randbelow(1000000):06d}"
print(secure_otp)
file_path="D:\\quizqr\\qr.png"
qr=qrcode.QRCode()
qr.add_data(secure_otp)
img=qr.make_image()
img.save(file_path)
print("qr generated")