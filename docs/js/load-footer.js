async function loadFooter() {
  try {
    const res = await fetch("components/footer.html");
    if (!res.ok) throw new Error("No se pudo cargar el footer");
    const footerHTML = await res.text();
    document.getElementById("footer-container").innerHTML = footerHTML;
  } catch (error) {
    console.error("Error cargando footer:", error);
  }
}

loadFooter();
