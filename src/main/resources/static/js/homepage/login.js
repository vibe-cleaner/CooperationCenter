async function loadPageContent() {
    const response = await fetch(window.location.pathname, {
        credentials: 'include'
    });

    const contentType = response.headers.get('Content-Type');

    if (contentType && contentType.includes('application/json')) {
        const result = await response.json();

        if (result.code === 'TOKEN-0000') {
            const shouldRefresh = confirm("세션이 만료되었습니다. 연장하시겠습니까?");
            if (shouldRefresh) {
                const refreshRes = await fetch('/api/v1/member/refresh', {
                    method: 'POST',
                    credentials: 'include'
                });
                const refreshJson = await refreshRes.json();
                if (refreshJson.isSuccess) {
                    location.reload(); // 새로고침 (토큰 갱신 후)
                } else {
                    alert("다시 로그인해주세요.");
                    window.location.href = "/member/login";
                }
            } else {
                window.location.href = "/member/login";
            }
            return;
        }
    }

    // JSON 아니면 일반 HTML로 간주 → 그대로 렌더링
    const html = await response.text();
    document.open();
    document.write(html);
    document.close();
}

document.addEventListener('turbo:load', () => {
    const webLoginBtn = document.getElementById("web-login-button");
    const mobileLoginBtn = document.getElementById("mobile-login-button");

    if (webLoginBtn) setupLoginLogoutHandler(webLoginBtn);
    if (mobileLoginBtn) setupLoginLogoutHandler(mobileLoginBtn);
})

function setupLoginLogoutHandler(btn) {
    if (!btn) return;

    btn.addEventListener("click", () => {
        const label = btn.textContent.trim();

        if (label === "로그인") {
            window.location.href = "/member/login";
        } else if(label === "로그아웃") {
            console.log("로그아웃 버튼 클릭");
            fetch("/api/v1/member/logout", {
                method: "POST",
                credentials: "include"
            }).then(response => {
                if (response.ok) {
                    window.location.href = "/home";
                } else {
                    alert("로그아웃 실패");
                }
            }).catch(err => {
                console.error("로그아웃 오류:", err);
                alert("오류 발생");
            });
        }else {
            window.location.href = "/profile";

        }
    });
}
