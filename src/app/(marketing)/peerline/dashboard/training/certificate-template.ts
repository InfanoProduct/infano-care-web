export const getCertificateTemplate = (userName: string, date: string) => `
<!DOCTYPE html>
<html>
  <head>
    <title>PeerLine Mentor Certificate - ${userName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;700;900&family=Great+Vibes&display=swap" rel="stylesheet">
    <style>
      @page {
        size: landscape;
        margin: 0;
      }
      body { 
        margin: 0; 
        padding: 0; 
        font-family: 'Inter', sans-serif; 
        background: #f8fafc;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
      }
      .cert-wrapper {
        width: 1000px;
        height: 700px;
        background: white;
        padding: 20px;
        box-sizing: border-box;
        box-shadow: 0 40px 100px rgba(0,0,0,0.1);
        position: relative;
        display: flex;
        flex-direction: column;
      }
      .cert-outer-border {
        border: 2px solid #6D28D9;
        flex: 1;
        padding: 10px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      }
      .cert-inner-border {
        border: 4px double #6D28D9;
        flex: 1;
        padding: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        position: relative;
        background: white;
        background-image: 
          radial-gradient(#6D28D9 0.5px, transparent 0.5px);
        background-size: 30px 30px;
        background-color: #ffffff;
        box-sizing: border-box;
      }
      /* Overlay to fade the background pattern */
      .cert-inner-border::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: white;
        opacity: 0.96;
        z-index: 1;
      }
      .cert-content {
        position: relative;
        z-index: 10;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .header-section { margin-bottom: 10px; }
      .logo { 
        font-size: 24px; 
        font-weight: 900; 
        color: #6D28D9; 
        letter-spacing: -1px;
      }
      .subtitle { 
        font-size: 12px; 
        font-weight: 900; 
        color: #94A3B8; 
        text-transform: uppercase; 
        letter-spacing: 6px; 
        margin-top: 5px;
      }
      .title-section { margin-top: 10px; }
      .main-title { 
        font-family: 'Playfair Display', serif; 
        font-size: 56px; 
        font-weight: 900;
        color: #1E293B; 
        margin: 0;
        line-height: 1.1;
      }
      .cert-type {
        font-size: 16px;
        font-weight: 600;
        color: #6D28D9;
        letter-spacing: 2px;
        margin-top: 5px;
      }
      .name-section { margin: 20px 0; }
      .presented-to { 
        font-size: 16px; 
        color: #64748B; 
        font-style: italic;
        margin-bottom: 10px;
      }
      .user-name { 
        font-family: 'Great Vibes', cursive; 
        font-size: 72px; 
        color: #1E293B; 
        line-height: 1;
        margin: 0;
      }
      .description { 
        font-size: 16px; 
        color: #475569; 
        max-width: 650px; 
        margin: 0 auto; 
        line-height: 1.6;
      }
      .footer { 
        width: 100%;
        display: flex; 
        justify-content: space-between; 
        align-items: flex-end; 
        padding: 0 20px;
        box-sizing: border-box;
      }
      .sign-block { 
        text-align: center;
        width: 200px; 
      }
      .signature {
        font-family: 'Great Vibes', cursive;
        font-size: 28px;
        color: #6D28D9;
      }
      .sign-line {
        border-top: 1px solid #CBD5E1;
        margin: 5px 0;
      }
      .sign-name { 
        font-weight: 700; 
        color: #1E293B; 
        font-size: 12px;
        text-transform: uppercase;
      }
      .sign-title { 
        font-size: 10px; 
        color: #94A3B8; 
        text-transform: uppercase; 
      }
      .seal {
        width: 100px;
        height: 100px;
        background: #6D28D9;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 10px 25px rgba(109, 40, 217, 0.2);
        border: 4px double #E9D5FF;
      }
      .seal::before {
        content: '✓';
        color: white;
        font-size: 40px;
        font-weight: 900;
      }
      @media print {
        body { background: none; }
        .cert-wrapper { 
          box-shadow: none; 
          margin: 0;
          width: 100%;
          height: 100%;
        }
      }
    </style>
  </head>
  <body>
    <div class="cert-wrapper">
      <div class="cert-outer-border">
        <div class="cert-inner-border">
          <div class="cert-content">
            <div class="header-section">
              <div class="logo">PeerLine</div>
              <div class="subtitle">Official Recognition</div>
            </div>

            <div class="title-section">
              <h1 class="main-title">Certificate of Merit</h1>
              <div class="cert-type">CERTIFIED PEER MENTOR</div>
            </div>
            
            <div class="name-section">
              <div class="presented-to">This is to certify that</div>
              <div class="user-name">${userName || 'Peer Mentor'}</div>
            </div>
            
            <div class="description">
              Has demonstrated exceptional commitment and proficiency in the 
              <strong>PeerLine Mentor Training Program</strong>. By mastering the principles of 
              empathic communication and safeguarding, they are hereby recognized as a qualified support partner.
            </div>
            
            <div class="footer">
              <div class="sign-block">
                <div class="signature">${date}</div>
                <div class="sign-line"></div>
                <div class="sign-name">Date Issued</div>
                <div class="sign-title">Verification Timestamp</div>
              </div>
              
              <div class="seal"></div>
              
              <div class="sign-block">
                <div class="signature">Infano Team</div>
                <div class="sign-line"></div>
                <div class="sign-name">Program Director</div>
                <div class="sign-title">PeerLine Administration</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <script>
      window.onload = function() { 
        setTimeout(() => {
          window.print(); 
          window.close(); 
        }, 500);
      }
    </script>
  </body>
</html>
`;
;
