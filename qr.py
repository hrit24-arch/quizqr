import qrcode
import secrets
import os
secure_otp=f"{secrets.randbelow(1000000):06d}"
print(secure_otp)
file_path="D:\\quizqr"
counter = 1

while os.path.exists(os.path.join(file_path, f"qr_{counter}.png")):
    counter += 1

file_path = os.path.join(file_path, f"qr_{counter}.png")
qr=qrcode.QRCode()
qr.add_data(secure_otp)
img=qr.make_image()
img.save(file_path)
print("qr generated")
