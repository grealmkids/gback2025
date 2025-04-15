  verifyOtp(data: any) {
    const requestData = {
      phoneOrEmail: localStorage.getItem('phoneOrEmail'), // Retrieve phoneOrEmail from localStorage or another source
      otp: data.otp
    };

    this.albumService.verifyOtp(requestData).subscribe(
      (response) => {
        this.message = response.message;
      },
      (error) => {
        this.message = 'Failed to verify OTP. Please try again.';
      }
    );
  }